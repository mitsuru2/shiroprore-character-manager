//==============================================================================
// Import modules.
//
import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { Firestore, doc, runTransaction, serverTimestamp } from '@angular/fire/firestore';
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
import { FirestoreCollectionDummy } from './firestore-collection-dummy.class';
import { ErrorHandlerService } from '../error-handler/error-handler.service';
import { ErrorCode } from '../error-handler/error-code.enum';

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

  loaded = false;

  collections: { [key in FsCollectionName]: FirestoreCollectionWrapper<any> | FirestoreCollectionDummy<any> } = {
    [FsCollectionName.Abilities]:         new FirestoreCollectionWrapper<FsAbility>          (this.fs, FsCollectionName.Abilities), // eslint-disable-line
    [FsCollectionName.AbilityTypes]:      new FirestoreCollectionDummy<FsAbilityType>        (         FsCollectionName.AbilityTypes), // eslint-disable-line
    [FsCollectionName.CharacterTags]:     new FirestoreCollectionWrapper<FsCharacterTag>     (this.fs, FsCollectionName.CharacterTags), // eslint-disable-line
    [FsCollectionName.CharacterTypes]:    new FirestoreCollectionWrapper<FsCharacterType>    (this.fs, FsCollectionName.CharacterTypes), // eslint-disable-line
    [FsCollectionName.Characters]:        new FirestoreCollectionWrapper<FsCharacter>        (this.fs, FsCollectionName.Characters), // eslint-disable-line
    [FsCollectionName.Facilities]:        new FirestoreCollectionWrapper<FsFacility>         (this.fs, FsCollectionName.Facilities), // eslint-disable-line
    [FsCollectionName.FacilityTypes]:     new FirestoreCollectionDummy<FsFacilityType>       (         FsCollectionName.FacilityTypes), // eslint-disable-line
    [FsCollectionName.GeographTypes]:     new FirestoreCollectionDummy<FsGeographType>       (         FsCollectionName.GeographTypes), // eslint-disable-line
    [FsCollectionName.Illustrators]:      new FirestoreCollectionWrapper<FsIllustrator>      (this.fs, FsCollectionName.Illustrators), // eslint-disable-line
    [FsCollectionName.Regions]:           new FirestoreCollectionDummy<FsRegion>             (         FsCollectionName.Regions), // eslint-disable-line
    [FsCollectionName.SubCharacterTypes]: new FirestoreCollectionWrapper<FsSubCharacterType> (this.fs, FsCollectionName.SubCharacterTypes), // eslint-disable-line
    [FsCollectionName.VoiceActors]:       new FirestoreCollectionWrapper<FsVoiceActor>       (this.fs, FsCollectionName.VoiceActors), // eslint-disable-line
    [FsCollectionName.WeaponTypes]:       new FirestoreCollectionDummy<FsWeaponType>         (         FsCollectionName.WeaponTypes), // eslint-disable-line
    [FsCollectionName.Weapons]:           new FirestoreCollectionWrapper<FsWeapon>           (this.fs, FsCollectionName.Weapons), // eslint-disable-line
  };

  /**
   * Class constructor.
   * It starts data loading.
   * @param fs Firestore is used to access database.
   * @param logger Logging utility.
   */
  constructor(private logger: NGXLogger, private fs: Firestore, private errorHandler: ErrorHandlerService) {
    this.logger.trace('new FirestoreDataService()');

    this.loadAll();
  }

  /**
   * It loads all data collections.
   */
  async loadAll(): Promise<void> {
    const location = `${this.className}.loadAll()`;

    try {
      await Promise.all([
        this.load(FsCollectionName.Abilities),
        this.load(FsCollectionName.AbilityTypes),
        this.load(FsCollectionName.CharacterTags),
        this.load(FsCollectionName.CharacterTypes),
        this.load(FsCollectionName.Characters),
        this.load(FsCollectionName.Facilities),
        this.load(FsCollectionName.FacilityTypes),
        this.load(FsCollectionName.GeographTypes),
        this.load(FsCollectionName.Illustrators),
        this.load(FsCollectionName.Regions),
        this.load(FsCollectionName.SubCharacterTypes),
        this.load(FsCollectionName.VoiceActors),
        this.load(FsCollectionName.Weapons),
        this.load(FsCollectionName.WeaponTypes),
      ]);
      this.logger.info(location, 'Firestore data loading finished.');
      this.loaded = true;
    } catch {
      this.logger.error(location, 'Firestore data loading failed.');
    }
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
    } catch (error) {
      this.logger.error(location, error);
      this.errorHandler.notifyError(ErrorCode.InternalServerError, [
        'Firestore data loading failed.',
        `Collection Name: ${name}`,
      ]);
    }

    return result;
  }

  // startListening(name: FsCollectionName, errorFn?: (e: Error) => void) {
  //   this.logger.trace(`FirestoreDataService.startListening(${name})`);
  //   this.collections[name as FsCollectionName].startListening(errorFn);
  // }

  // stopListening(name: FsCollectionName) {
  //   this.logger.trace(`FirestoreDataService.startListening(${name})`);
  //   this.collections[name as FsCollectionName].stopListening();
  // }

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
    const location = `${this.className}.addData()`;
    this.logger.trace(location, { name: name, data: data.name });

    const docId = await this.collections[name].add(data);
    return docId;
  }

  async pushToListField<TField>(
    name: FsCollectionName,
    docId: string,
    fieldName: string,
    value: TField
  ): Promise<string> {
    const location = `${this.className}.pushToListField()`;
    this.logger.trace(location, { name: name, docId: docId, field: fieldName });

    const docIdResult = await this.collections[name].pushToListField<TField>(docId, fieldName, value);
    return docIdResult;
  }

  /**
   * Increment 'count' field of the specified document.
   * @param name Data collection name.
   * @param docId Document ID.
   * @returns Promise with number. The number represents the counter value after increment.
   */
  async incrementCounter(name: FsCollectionName, docId: string): Promise<number> {
    const location = `${this.className}.incrementCounter()`;
    this.logger.trace(location, { name: name, docId: docId });

    const count = await this.collections[name].incrementCounter(docId);
    return count;
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
}
