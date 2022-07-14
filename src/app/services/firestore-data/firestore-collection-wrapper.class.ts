import { FsCollectionName } from './firestore-collection-name.enum';
import {
  addDoc,
  collection,
  CollectionReference,
  doc,
  Firestore,
  getDocs,
  query,
  Query,
  QuerySnapshot,
  runTransaction,
  serverTimestamp,
  where,
} from '@angular/fire/firestore';
import { Unsubscribe } from '@angular/fire/app-check';
import { FsDocumentBase } from './firestore-document.interface';
import { indexedDbWrapper } from './indexed-db-wrapper.class';

export class FirestoreCollectionWrapper<T extends FsDocumentBase> {
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
   * Offline cache will NOT used.
   * @returns Promise<number>. Data length.
   */
  async load(): Promise<number> {
    // Get timestamp of local storage.
    let timestamp = await indexedDbWrapper.getTimestamp(this.name);
    if (!timestamp) {
      timestamp = new Date('2022-07-13T00:00:00+0900'); // Default time stamp.
    }

    // Clear existing data.
    this.clearData();

    // Retrieve data from the local storage.
    const localData = await indexedDbWrapper.retrieveDataCollection(this.name);
    console.log(`${this.name} Items from indexed DB: ${localData.length}`);
    this.mergeData(localData);

    // Make query for firestore db.
    const q = query(this.collection, where('updatedAt', '>', timestamp));

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
        data.createdAt = serverTimestamp();
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
      throw error;
    }

    return docId;
  }

  /**
   * It update target data document.
   * It push input data to the specified field which is list type.
   * @param docId Document ID.
   * @param fieldName Target field name.
   * @param value Data to be pushed to the target list field.
   * @returns Document ID.
   */
  async pushToListField<TField>(docId: string, fieldName: string, value: TField): Promise<string> {
    // Get document reference.
    const docRef = doc(this.fs, `${this.name}/${docId}`);

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

      // Update specified field.
      const docData = docBody.data() as any;
      if (Object.keys(docData).includes(fieldName)) {
        docData[fieldName].push(value);
      }
      transaction.update(docRef, { [fieldName]: docData[fieldName] });
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

  //============================================================================
  // Private methods.
  //
  //----------------------------------------------------------------------------
  // Load data from server.
  //
  private async loadQuery(q: Query): Promise<any[]> {
    let result: any[] = [];
    let retryCnt = this.retryMax;

    // Getting data with retry.
    let snapshot = await this.getDocs(q);
    if (!snapshot) {
      while (retryCnt > 0) {
        await this.sleep(this.retryInterval);
        snapshot = await this.getDocs(q);
        console.log(`${this.name} retry: ${retryCnt}`);
        retryCnt--;
      }
    }

    // Check data.
    if (!snapshot) {
      throw Error(`Data loading failed. { name: ${this.name} }`);
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
    } catch (e) {
      console.log(`${this.name} error: ${e}`);
      snapshot = undefined;
    }

    return snapshot;
  }

  //----------------------------------------------------------------------------
  // Utility functions.
  //
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

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
        if (this.data[index].updatedAt < items[i].updatedAt) {
          this.data[index] = items[i];
        }
      }
    }
  }

  // private async getServerTimestamp(): Promise<Timestamp> {
  //   let timestamp = Timestamp.fromDate(new Date('2020-01-01T00:00:00'));

  //   // Do transaction.
  //   await runTransaction(this.fs, async (transaction) => {
  //     timestamp = serverTimestamp();
  //   });

  //   return timestamp;
  // }

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
