import { FsCollectionName } from './firestore-collection-name.enum';
import {
  addDoc,
  collection,
  CollectionReference,
  deleteDoc,
  doc,
  Firestore,
  getDocs,
  query,
  Query,
  QuerySnapshot,
  runTransaction,
  serverTimestamp,
  Timestamp,
  where,
} from '@angular/fire/firestore';
import { Unsubscribe } from '@angular/fire/app-check';
import { FsDocumentBase } from './firestore-document.interface';
import { indexedDbWrapper } from './indexed-db-wrapper.class';
import { sleep } from 'src/app/modules/main/utils/sleep/sleep.utility';
import { ErrorCode } from '../error-handler/error-code.enum';

export class FirestoreCollectionWrapper<T extends FsDocumentBase> {
  private readonly className = 'FirestoreCollectionWrapper';

  private collection: CollectionReference<T>;

  data: FsDocumentBase[];

  isLoaded: boolean;

  isListening: boolean;

  private unsubscribe?: Unsubscribe;

  private readonly retryMax = 2;

  private readonly retryInterval = 500; // ms.

  //============================================================================
  // Class methods.
  //
  constructor(private fs: Firestore, private name: FsCollectionName) {
    this.collection = collection(this.fs, name) as CollectionReference<T>;
    this.data = [];
    this.isLoaded = false;
    this.isListening = false;
  }

  /**
   * It loads data from server once. (not subscribing.)
   * IndexedDB is used as cache.
   * @uid User ID.
   * @returns Promise<number>. Data length.
   */
  async load(uid = ''): Promise<number> {
    // Get timestamp of local storage.
    let timestamp = await indexedDbWrapper.getTimestamp(this.name);

    // Clear existing data.
    this.clearData();

    // Retrieve data from the local storage.
    const localData = await indexedDbWrapper.retrieveDataCollection(this.name);
    console.log(`${this.name} Items from indexed DB: ${localData.length}`);
    this.mergeData(localData);

    // Make query for firestore db.
    let q = query(this.collection, where('updatedAt', '>', timestamp));
    if (uid !== '') {
      q = query(this.collection, where('updatedAt', '>', timestamp), where('name', '==', uid));
    }

    // Load data from firestore db.
    const remoteData = await this.loadQuery(q);
    console.log(`${this.name} Items from Firestore DB: ${remoteData.length}`);
    this.mergeData(remoteData);

    // Set 'isLoaded' flag.
    if (this.data.length > 0) {
      this.isLoaded = true;
    }

    return this.data.length;
  }

  /**
   * Add new document to the collection.
   * ID will be assigned automatically.
   * @param data Target data.
   * @returns Promise<string>. New document ID.
   */
  async add(data: T): Promise<string> {
    let docId = '';

    try {
      // Start transaction.
      await runTransaction(this.fs, async () => {
        // Reload data collection.
        await this.load();

        // If it found data which has same name as the target data.
        // It skip to add the target data because the data is already registered.
        for (let i = 0; i < this.data.length; ++i) {
          if (this.data[i].name === data.name) {
            docId = this.data[i].id;
            return;
          }
        }

        // Set 'createdAt' timestamp.
        data.createdAt = serverTimestamp() as Timestamp;
        data.updatedAt = data.createdAt;

        // Remove 'id' field from the target data.
        const tmp = { ...data } as any;
        delete tmp.id;

        // Add target data to the server.
        const docRef = await addDoc(this.collection, tmp as T);
        docId = docRef.id;

        return;
      });
    } catch (error) {
      (error as Error).name = ErrorCode.InternalServerError;
      throw error;
    }

    return docId;
  }

  /**
   * It updates field value specified by document ID and field name.
   * @param docId Document ID.
   * @param fieldName Field name of target document.
   * @param value Field value.
   * @returns Document ID.
   */
  async updateField(docId: string, fieldName: string, value: any): Promise<string> {
    const location = `${this.className}.updateField()`;

    // Get document reference.
    const path = `${this.name}/${docId}`;
    const docRef = doc(this.fs, path);

    // Run transaction.
    await runTransaction(this.fs, async (transaction) => {
      // Get target document.
      // Throw error if the target document is not existing.
      const docBody = await transaction.get(docRef);
      if (!docBody.exists()) {
        const error = new Error(`${location} Document was not found. { path: ${path} }`);
        error.name = ErrorCode.BadRequest;
        throw error;
      }

      // Update specified field.
      transaction.update(docRef, { [fieldName]: value });
      transaction.update(docRef, { updatedAt: serverTimestamp() });
    });

    return docId;
  }

  /**
   * Increment the 'count' field value.
   * @param docId Document ID.
   * @returns Counter value after increment.
   */
  async incrementCounter(docId: string): Promise<number> {
    // Get document reference.
    const docRef = doc(this.fs, `${this.name}/${docId}`);
    let count = 0;

    // Do transaction.
    await runTransaction(this.fs, async (transaction) => {
      // Get target document.
      // Throw error if the target document is not existing.
      const docBody = await transaction.get(docRef);
      if (!docBody.exists()) {
        throw Error(
          `FirestoreDataService.incrementCounter() | Document was not found. { path: ${this.name}/${docId} }`
        );
      }

      // Get counter value.
      const docData = docBody.data() as any;
      if (Object.keys(docData).includes('count')) {
        count = docData.count;
      }

      // Increment counter value.
      count += 1;

      // Update database.
      transaction.update(docRef, { count: count });
      transaction.update(docRef, { updatedAt: serverTimestamp() });
    });

    return count;
  }

  async delete(docId: string): Promise<void> {
    const location = `${this.className}.delete()`;

    try {
      const docRef = doc(this.fs, `${this.name}/${docId}`);
      await deleteDoc(docRef);
    } catch (e) {
      console.error(e);
      const error = new Error(`${location} Data delete failed. { collection: ${this.name}, docId: ${docId} }`);
      error.name = ErrorCode.InternalServerError;
      throw error;
    }
  }

  //============================================================================
  // Private methods.
  //
  //----------------------------------------------------------------------------
  // Load data from server.
  //
  private async loadQuery(q: Query): Promise<any[]> {
    const location = `${this.className}.loadQuery()`;
    let result: any[] = [];
    let retryCnt = this.retryMax;

    // Getting data with retry.
    let snapshot = await this.getDocs(q);
    if (!snapshot) {
      while (retryCnt > 0) {
        await sleep(this.retryInterval);
        snapshot = await this.getDocs(q);
        console.log(`${this.name} retry: ${retryCnt}`);
        retryCnt--;
      }
    }

    // Check data.
    if (!snapshot) {
      const error = new Error(`${location} { name: ${this.name}}`);
      error.name = ErrorCode.InternalServerError;
      throw error;
    }

    // Copy document ID and its data to "this.data" object.
    snapshot.forEach((document) => {
      const tmp = document.data() as T;
      tmp.id = document.id;
      result.push(tmp);
    });

    // Store data copy to the indexed DB.
    indexedDbWrapper.storeDataCollection(this.name, result);

    // Return data array.
    return result;
  }

  private async getDocs(collectionRef: Query): Promise<QuerySnapshot | undefined> {
    let snapshot: QuerySnapshot | undefined = undefined;

    try {
      snapshot = await getDocs(collectionRef);
    } catch {
      // Hide exception because retry procedure will be run at caller context.
      snapshot = undefined;
    }

    return snapshot;
  }

  //----------------------------------------------------------------------------
  // Utility functions.
  //
  private clearData() {
    while (this.data.length > 0) {
      this.data.pop();
    }
  }

  private mergeData(items: FsDocumentBase[]) {
    for (let i = 0; i < items.length; ++i) {
      // If there is no item sharing the same ID, simply push the data item.
      let index = this.data.findIndex((item) => item.id === items[i].id);
      if (index < 0) {
        this.data.push(items[i]);
      }

      // If there is already an item sharing the same ID, update item if it's new.
      else {
        // Get timestamps from all base and input lists.
        const timestampA = this.data[index].updatedAt as Timestamp;
        const timestampB = items[i].updatedAt as Timestamp;

        // Compare timestamps.
        if (timestampA.seconds < timestampB.seconds) {
          this.data[index] = items[i];
        } else if (timestampA.seconds === timestampB.seconds) {
          if (timestampA.nanoseconds < timestampB.nanoseconds) {
            this.data[index] = items[i];
          }
        } else {
          // Do nothing.
        }
      }
    }
  }

  //============================================================================
  // Removed class methods.
  //
  // /**
  //  * It starts listening data from server.
  //  * ATTENTION: Don't forget to do stop listening by stopListening().
  //  */
  // startListening(errorFn?: (e: Error) => void): void {
  //   this.isListening = true;

  //   const q = query(this.collection, orderBy('index'));

  //   this.unsubscribe = onSnapshot(
  //     // Query.
  //     q,

  //     // Success handler. (It corresponding next() of Observable.)
  //     // Copy received data and set 'isLoaded' flag.
  //     (snapshot) => {
  //       while (this.data.length > 0) {
  //         this.data.pop();
  //       }
  //       snapshot.forEach((document) => {
  //         const tmp = document.data();
  //         tmp.id = document.id;
  //         this.data.push(tmp);
  //       });
  //       this.isLoaded = true;
  //     },

  //     // Error handler.
  //     // 'isListening' flag is cleared because it will stop listening automatically by error.
  //     (error) => {
  //       this.isListening = false;
  //       if (errorFn != null) {
  //         errorFn(error);
  //       }
  //     }
  //   );
  // }

  // /**
  //  * It stops listening.
  //  */
  // stopListening(): void {
  //   if (this.unsubscribe != null && this.isListening === true) {
  //     this.unsubscribe();
  //     this.isListening = false;
  //   }
  // }
}
