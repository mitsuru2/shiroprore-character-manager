//==============================================================================
// Import modules.
//
import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { Firestore, doc, runTransaction, DocumentReference } from '@angular/fire/firestore';
import { FsCollectionName } from './firestore-collection-name.enum';
import {
  FsAbility,
  FsAbilityType,
  FsCharacter,
  FsSubCharacterType,
  FsCharacterTag,
  FsCharacterType,
  FsDocumentBaseWithCode,
  FsDocumentBaseWithOrder,
  FsFacility,
  FsFacilityType,
  FsGeographType,
  FsIllustrator,
  FsRegion,
  FsVoiceActor,
  FsWeapon,
  FsWeaponType,
} from './firestore-document.interface';
import { FirestoreCollectionWrapper } from './firestore-collection-wrapper.class';

//==============================================================================
// Service class implementation.
//
/**
 * FirestoreDataService
 *
 * It supports following functionalites:
 *  - One time data loading.
 *  - Continuous data listening.
 *  - New document creation to the specified collection.
 *  - Increment counter for FsDocumentBaseWidhCode.
 *  - Data sorting.
 */
@Injectable({
  providedIn: 'root',
})
export class FirestoreDataService {
  private className = 'FirestoreDataService';

  collections: { [key in FsCollectionName]: FirestoreCollectionWrapper<any> } = {
    [FsCollectionName.Abilities]:      new FirestoreCollectionWrapper<FsAbility>       (this.fs, FsCollectionName.Abilities), // eslint-disable-line
    [FsCollectionName.AbilityTypes]:   new FirestoreCollectionWrapper<FsAbilityType>   (this.fs, FsCollectionName.AbilityTypes), // eslint-disable-line
    [FsCollectionName.CharacterTags]:  new FirestoreCollectionWrapper<FsCharacterTag>  (this.fs, FsCollectionName.CharacterTags), // eslint-disable-line
    [FsCollectionName.CharacterTypes]: new FirestoreCollectionWrapper<FsCharacterType> (this.fs, FsCollectionName.CharacterTypes), // eslint-disable-line
    [FsCollectionName.Characters]:     new FirestoreCollectionWrapper<FsCharacter>     (this.fs, FsCollectionName.Characters), // eslint-disable-line
    [FsCollectionName.Facilities]:     new FirestoreCollectionWrapper<FsFacility>      (this.fs, FsCollectionName.Facilities), // eslint-disable-line
    [FsCollectionName.FacilityTypes]:  new FirestoreCollectionWrapper<FsFacilityType>  (this.fs, FsCollectionName.FacilityTypes), // eslint-disable-line
    [FsCollectionName.GeographTypes]:  new FirestoreCollectionWrapper<FsGeographType>  (this.fs, FsCollectionName.GeographTypes), // eslint-disable-line
    [FsCollectionName.Illustrators]:   new FirestoreCollectionWrapper<FsIllustrator>   (this.fs, FsCollectionName.Illustrators), // eslint-disable-line
    [FsCollectionName.Regions]:        new FirestoreCollectionWrapper<FsRegion>        (this.fs, FsCollectionName.Regions), // eslint-disable-line
    [FsCollectionName.VoiceActors]:    new FirestoreCollectionWrapper<FsVoiceActor>    (this.fs, FsCollectionName.VoiceActors), // eslint-disable-line
    [FsCollectionName.WeaponTypes]:    new FirestoreCollectionWrapper<FsWeaponType>    (this.fs, FsCollectionName.WeaponTypes), // eslint-disable-line
    [FsCollectionName.Weapons]:        new FirestoreCollectionWrapper<FsWeapon>        (this.fs, FsCollectionName.Weapons), // eslint-disable-line
  };

  /**
   * Class constructor.
   * It starts data loading.
   * @param fs Firestore is used to access database.
   * @param logger Logging utility.
   */
  constructor(private fs: Firestore, private logger: NGXLogger) {
    this.logger.trace('new FirestoreDataService()');
  }

  /**
   * It loads all document data of the target collection once.
   * @param name Firestore collection name.
   * @returns Promise<number>. Return true if it succeeded.
   */
  async load(name: FsCollectionName): Promise<number> {
    const location = `${this.className}.load()`;
    this.logger.trace(location, { name: name });

    let result: number = 0;

    try {
      const collection = this.collections[name as FsCollectionName];
      result = await collection.load();

      // Special process for CharacterTypes collection.
      // It needs sub collection loading.
      if (name === FsCollectionName.CharacterTypes) {
        await this.loadSubCharacterTypes();
      }
    } catch (error) {
      throw error;
    }

    // this.logger.debug(location, { name: name, data: this.collections[name].data });

    return result;
  }

  startListening(name: FsCollectionName, errorFn?: (e: Error) => void) {
    this.logger.trace(`FirestoreDataService.startListening(${name})`);
    this.collections[name as FsCollectionName].startListening(errorFn);
  }

  stopListening(name: FsCollectionName) {
    this.logger.trace(`FirestoreDataService.startListening(${name})`);
    this.collections[name as FsCollectionName].stopListening();
  }

  /**
   * It returns data body of target data collection.
   * User shall cast the got data.
   * @param name Data collection name.
   * @returns Data body of target data collection.
   */
  getData(name: FsCollectionName) {
    this.logger.trace(`FirestoreDataService.getData(${name})`);
    return this.collections[name].data;
  }

  /**
   * It adds new data to the specified data collection.
   * And it returns document ID.
   * @param name Data collection name.
   * @param data Target data.
   * @returns Data document ID.
   */
  async addData(name: FsCollectionName, data: any): Promise<string> {
    const docId = await this.collections[name].add(data);
    return docId;
  }

  async pushToListField<TField>(
    name: FsCollectionName,
    docId: string,
    fieldName: string,
    value: TField
  ): Promise<string> {
    const docIdResult = await this.collections[name].pushToListField<TField>(docId, fieldName, value);
    return docIdResult;
  }

  /**
   * Increment 'count' field of the specified document.
   * @param name Data collection name.
   * @param docId Document ID.
   * @returns Promise with number. The number represents the counter value after increment.
   */
  async incrementCounter(name: FsCollectionName, docId: string, subName?: string, subDocId?: string): Promise<number> {
    const location = `${this.className}.incrementCounter()`;
    this.logger.trace(location, { name: name, docId: docId, subName: subName, subDocId: subDocId });

    if (
      name === FsCollectionName.CharacterTypes ||
      name === FsCollectionName.FacilityTypes ||
      name === FsCollectionName.WeaponTypes
    ) {
      let docRef: DocumentReference;
      if (!subName || !subDocId) {
        docRef = doc(this.fs, `${name}/${docId}`);
      } else {
        docRef = doc(this.fs, `${name}/${docId}/${subName}/${subDocId}`);
      }
      let count = 0;

      await runTransaction(this.fs, async (transaction) => {
        const docBody = await transaction.get(docRef);

        if (!docBody.exists()) {
          this.logger.error(
            `FirestoreDataService.incrementCounter() | Document was not found. { path: ${name}/${docId} }`
          );
          throw Error(`FirestoreDataService.incrementCounter() | Document was not found. { path: ${name}/${docId} }`);
        }

        count = (docBody.data() as FsCharacterType).count;
        count += 1;
        transaction.update(docRef, { count: count });
      });

      return count;
    } else {
      this.logger.error(`FirestoreDataService.incrementCounter() | Unsupported collection. { name: ${name} }`);
      throw Error(`FirestoreDataService.incrementCounter() | Unsupported collection. { name: ${name} }`);
    }
  }

  sortByOrder(items: FsDocumentBaseWithOrder[], isDesc: boolean = false) {
    const location = `${this.className}.sortByOrder()`;
    this.logger.trace(location);

    // Ascending order.
    if (isDesc === false) {
      items.sort((a, b) => a.order - b.order);
    }
    // Descending order.
    else {
      items.sort((a, b) => b.order - a.order);
    }
  }

  sortByCode(items: FsDocumentBaseWithCode[], isDesc: boolean = false) {
    const location = `${this.className}.sortByCode()`;
    this.logger.trace(location);

    // Ascending order.
    if (isDesc === false) {
      items.sort((a, b) => {
        return a.code < b.code ? -1 : 1;
      });
    }
    // Descending order.
    else {
      items.sort((a, b) => {
        return b.code < a.code ? -1 : 1;
      });
    }
  }

  private async loadSubCharacterTypes() {
    // const location = `${this.className}.loadSubCharacterTypes()`;
    const fsCollection = this.collections[FsCollectionName.CharacterTypes];

    for (let i = 0; i < fsCollection.data.length; ++i) {
      const docData = fsCollection.data[i] as FsCharacterType;
      if (docData.hasSubTypes) {
        const tmp = await fsCollection.loadSub<FsSubCharacterType>(docData.id, 'SubTypes');
        if (!docData.subTypes) {
          docData.subTypes = tmp;
        } else {
          while (docData.subTypes.length > 0) {
            docData.subTypes.pop();
          }
          for (let j = 0; j < tmp.length; ++j) {
            docData.subTypes.push(tmp[j]);
          }
        }
      } else {
        docData.subTypes = [];
      }
    }
  }
}
