import { FsCollectionName } from './firestore-collection-name.enum';
import {
  addDoc,
  collection,
  CollectionReference,
  doc,
  Firestore,
  getDocs,
  getDocsFromServer,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
} from '@angular/fire/firestore';
import { Unsubscribe } from '@angular/fire/app-check';
import { FsDocumentBase } from './firestore-document.interface';

export class FirestoreCollectionWrapper<T extends FsDocumentBase> {
  private collection: CollectionReference<T>;

  data: FsDocumentBase[];

  isLoaded: boolean;

  isListening: boolean;

  private unsubscribe?: Unsubscribe;

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
    // Clear current data.
    while (this.data.length > 0) {
      this.data.pop();
    }

    // Get data.
    try {
      // Copy document ID and its data to "this.data" object, if it's not empty.
      const snapshot = await getDocs(this.collection);
      if (snapshot.empty) {
        throw Error(`${location} Empty data.`);
      }
      snapshot.forEach((document) => {
        const tmp = document.data();
        tmp.id = document.id;
        this.data.push(tmp);
      });
      this.isLoaded = true;
    } catch (error) {
      throw error;
    }

    // Return data length.
    return Object.keys(this.data).length;
  }

  async loadSub<TSub extends FsDocumentBase>(docId: string, subName: string): Promise<TSub[]> {
    const result: TSub[] = [];

    // Get data.
    try {
      // Copy document ID and its data to "this.data" object, if it's not empty.
      const subCollection = collection(this.fs, this.name, docId, subName) as CollectionReference<TSub>;
      const snapshot = await getDocsFromServer(subCollection);
      if (snapshot.empty) {
        throw Error(`${location} Empty data.`);
      }
      snapshot.forEach((document) => {
        const tmp = document.data() as TSub;
        tmp.id = document.id;
        result.push(tmp);
      });
    } catch (error) {
      throw error;
    }

    return result;
  }

  /**
   * It starts listening data from server.
   * ATTENTION: Don't forget to do stop listening by stopListening().
   */
  startListening(errorFn?: (e: Error) => void): void {
    this.isListening = true;

    const q = query(this.collection, orderBy('index'));

    this.unsubscribe = onSnapshot(
      // Query.
      q,

      // Success handler. (It corresponding next() of Observable.)
      // Copy received data and set 'isLoaded' flag.
      (snapshot) => {
        while (this.data.length > 0) {
          this.data.pop();
        }
        snapshot.forEach((document) => {
          const tmp = document.data();
          tmp.id = document.id;
          this.data.push(tmp);
        });
        this.isLoaded = true;
      },

      // Error handler.
      // 'isListening' flag is cleared because it will stop listening automatically by error.
      (error) => {
        this.isListening = false;
        if (errorFn != null) {
          errorFn(error);
        }
      }
    );
  }

  /**
   * It stops listening.
   */
  stopListening(): void {
    if (this.unsubscribe != null && this.isListening === true) {
      this.unsubscribe();
      this.isListening = false;
    }
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
    });

    return docId;
  }
}
