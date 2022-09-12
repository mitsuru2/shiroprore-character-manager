//==============================================================================
// Import modules.
//
import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { Firestore, Timestamp } from '@angular/fire/firestore';
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
  FsDocumentBase,
  FsUser,
  MapCellType,
  FsVersion,
} from './firestore-document.interface';
import { FirestoreCollectionWrapper } from './firestore-collection-wrapper.class';
import { FirestoreCollectionDummy } from './firestore-collection-dummy.class';
import { ErrorHandlerService } from '../error-handler/error-handler.service';
import { ErrorCode } from '../error-handler/error-code.enum';
import { sleep } from 'src/app/modules/main/utils/sleep/sleep.utility';

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
    [FsCollectionName.Users]:             new FirestoreCollectionWrapper<FsUser>             (this.fs, FsCollectionName.Users), // eslint-disable-line
    [FsCollectionName.Versions]:          new FirestoreCollectionWrapper<FsVersion>          (this.fs, FsCollectionName.Versions), // eslint-disable-line
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

    try {
      this.loadAll();
    } catch (error) {
      this.logger.error(location, error);
      this.errorHandler.notifyError(error);
    }
  }

  /**
   * It loads all data collections.
   */
  async loadAll(): Promise<void> {
    const location = `${this.className}.loadAll()`;
    this.loaded = false;

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
      this.load(FsCollectionName.Versions),
      this.load(FsCollectionName.VoiceActors),
      this.load(FsCollectionName.Weapons),
      this.load(FsCollectionName.WeaponTypes),
    ]);
    this.logger.info(location, 'Firestore data loading finished.');
    this.loaded = true;
  }

  /**
   * It loads all document data of the target collection once.
   * @param name Firestore collection name.
   * @returns Promise<number>. Return true if it succeeded.
   */
  async load(name: FsCollectionName, uid = ''): Promise<number> {
    const location = `${this.className}.load()`;
    if (uid === '') {
      this.logger.trace(location, { name: name });
    } else {
      this.logger.trace(location, { name: name, uid: uid });
    }

    let result: number = 0;

    const collection = this.collections[name as FsCollectionName];
    result = await collection.load(uid);

    return result;
  }

  /**
   * It returns data body of target data collection.
   * User shall cast the got data.
   * @param name Data collection name.
   * @returns Data body of target data collection.
   */
  getData(name: FsCollectionName) {
    const location = `${this.className}.getData()`;
    this.logger.trace(location, { name: name });

    return this.collections[name].data;
  }

  /**
   * It returns one data document specified by input ID.
   * @param name Data collection name.
   * @param id Document ID.
   * @returns Data document or 'undefined'.
   */
  getDataById(name: FsCollectionName, id: string): FsDocumentBase {
    const location = `${this.className}.getDataById()`;
    this.logger.trace(location, { name: name, id: id });

    let tmp = this.collections[name].data.find((item) => item.id === id);
    if (!tmp) {
      const error = new Error(`No data is found. { name: ${name}, docId: ${id} }`);
      error.name = ErrorCode.BadRequest;
      this.logger.error(location, error);
      throw error;
    }

    return tmp;
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
    this.logger.trace(location, { name: name, data: data });

    const docId = await this.collections[name].add(data);
    return docId;
  }

  async updateField(name: FsCollectionName, docId: string, fieldName: string, value: any): Promise<string> {
    const location = `${this.className}.updateField()`;
    this.logger.trace(location, { name: name, docId: docId, field: fieldName, value: value });

    const docIdResult = await this.collections[name].updateField(docId, fieldName, value);
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

  async removeData(name: FsCollectionName, docId: string): Promise<void> {
    const location = `${this.className}.removeData()`;
    this.logger.trace(location, { name: name, docId: docId });
    await this.collections[name].delete(docId);
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

  sortMapCellTypes(items: MapCellType[], isDesc: boolean = false) {
    const location = `${this.className}.sortMapCellTypes()`;
    this.logger.trace(location, { items: items });

    items.sort((a, b) => {
      const va = this.calcMapCellTypeOrder(a);
      const vb = this.calcMapCellTypeOrder(b);

      if (!isDesc) {
        return va - vb;
      } else {
        return vb - va;
      }
    });
  }

  sortByTimestamp(items: FsDocumentBase[], key: 'updatedAt' | 'createdAt', isDesc: boolean = false) {
    const location = `${this.className}.sortByTimestamp()`;
    this.logger.trace(location, { items: items });

    items.sort((a, b) => {
      const ta = (key === 'createdAt' ? a.createdAt : a.updatedAt) as Timestamp;
      const tb = (key === 'createdAt' ? b.createdAt : b.updatedAt) as Timestamp;

      if (ta.seconds !== tb.seconds) {
        if (!isDesc) {
          return ta.seconds - tb.seconds;
        } else {
          return tb.seconds - ta.seconds;
        }
      } else {
        if (!isDesc) {
          return ta.nanoseconds - tb.nanoseconds;
        } else {
          return tb.nanoseconds - tb.nanoseconds;
        }
      }
    });
  }

  async waitInit() {
    while (!this.loaded) {
      await sleep(100);
    }
  }

  private calcMapCellTypeOrder(cType: MapCellType): number {
    if (cType === '赤') {
      return 0;
    } else if (cType === '青') {
      return 1;
    } else if (cType === '赤青') {
      return 2;
    } else if (cType === '舟') {
      return 3;
    } else {
      return 4;
    }
  }
}
