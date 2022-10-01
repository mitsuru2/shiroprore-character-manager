/* eslint-disable @typescript-eslint/no-use-before-define */
// eslint-disable-next-line import/no-named-as-default
import { Dexie, Table } from 'dexie';
import { ErrorCode } from '../error-handler/error-code.enum';
import { FsCollectionName } from './firestore-collection-name.enum';
import {
  FsAbility,
  FsAnnounce,
  FsCharacter,
  FsCharacterTag,
  FsCharacterType,
  FsDocumentBase,
  FsFacility,
  FsIllustrator,
  FsSubCharacterType,
  FsUser,
  FsVersion,
  FsVoiceActor,
  FsWeapon,
} from './firestore-document.interface';

// export type DexieDatabase = { [P in keyof Dexie]: Dexie[P] };

export interface StoredAtTimestampMap {
  name: string;
  timestamp: Date;
}

// export interface ShiroproreDatabase extends Dexie {
//   [FsCollectionName.Abilities]: Dexie.Table<FsAbility, string>;
//   [FsCollectionName.CharacterTags]: Dexie.Table<FsCharacterTag, string>;
//   [FsCollectionName.CharacterTypes]: Dexie.Table<FsCharacterType, string>;
//   [FsCollectionName.Characters]: Dexie.Table<FsCharacter, string>;
//   [FsCollectionName.Facilities]: Dexie.Table<FsFacility, string>;
//   [FsCollectionName.Illustrators]: Dexie.Table<FsIllustrator, string>;
//   [FsCollectionName.SubCharacterTypes]: Dexie.Table<FsSubCharacterType, string>;
//   [FsCollectionName.VoiceActors]: Dexie.Table<FsVoiceActor, string>;
//   [FsCollectionName.Weapons]: Dexie.Table<FsWeapon, string>;
//   TimestampMap: Dexie.Table<FieldValue, string>;
// }

export class IndexedDbWrapper extends Dexie {
  static readonly dbName = 'shiroprore-character-manager-db';

  static readonly className = 'IndexedDbWrapper';

  abilities!: Table<FsAbility, string>;

  announces!: Table<FsAnnounce, string>;

  characterTags!: Table<FsCharacterTag, string>;

  characterTypes!: Table<FsCharacterType, string>;

  characters!: Table<FsCharacter, string>;

  facilities!: Table<FsFacility, string>;

  illustrators!: Table<FsIllustrator, string>;

  subCharacterTypes!: Table<FsSubCharacterType, string>;

  users!: Table<FsUser, string>;

  versions!: Table<FsVersion, string>;

  voiceActors!: Table<FsVoiceActor, string>;

  weapons!: Table<FsWeapon, string>;

  timeStamps!: Table<StoredAtTimestampMap, string>;

  //============================================================================
  // Class methods.
  //
  constructor() {
    super(IndexedDbWrapper.dbName);
    this.version(4).stores({
      abilities: 'id',
      announces: 'id',
      characterTags: 'id',
      characterTypes: 'id',
      characters: 'id',
      facilities: 'id',
      illustrators: 'id',
      subCharacterTypes: 'id',
      users: 'id',
      versions: 'id',
      voiceActors: 'id',
      weapons: 'id',
      timeStamps: 'name',
    });
  }

  async storeDataCollection(name: string, data: FsDocumentBase[]) {
    const location = `${IndexedDbWrapper.className}.storeDataCollection()`;
    const timestamp = new Date();

    if (name === FsCollectionName.Abilities) {
      await indexedDbWrapper.abilities.bulkPut(data as FsAbility[]);
      await indexedDbWrapper.timeStamps.put({ name: name, timestamp: timestamp });
    } else if (name === FsCollectionName.Announces) {
      await indexedDbWrapper.announces.bulkPut(data as FsAnnounce[]);
      await indexedDbWrapper.timeStamps.put({ name: name, timestamp: timestamp });
    } else if (name === FsCollectionName.CharacterTags) {
      await indexedDbWrapper.characterTags.bulkPut(data as FsCharacterTag[]);
      await indexedDbWrapper.timeStamps.put({ name: name, timestamp: timestamp });
    } else if (name === FsCollectionName.CharacterTypes) {
      await indexedDbWrapper.characterTypes.bulkPut(data as FsCharacterType[]);
      await indexedDbWrapper.timeStamps.put({ name: name, timestamp: timestamp });
    } else if (name === FsCollectionName.Characters) {
      await indexedDbWrapper.characters.bulkPut(data as FsCharacter[]);
      await indexedDbWrapper.timeStamps.put({ name: name, timestamp: timestamp });
    } else if (name === FsCollectionName.Facilities) {
      await indexedDbWrapper.facilities.bulkPut(data as FsFacility[]);
      await indexedDbWrapper.timeStamps.put({ name: name, timestamp: timestamp });
    } else if (name === FsCollectionName.Illustrators) {
      await indexedDbWrapper.illustrators.bulkPut(data as FsIllustrator[]);
      await indexedDbWrapper.timeStamps.put({ name: name, timestamp: timestamp });
    } else if (name === FsCollectionName.SubCharacterTypes) {
      await indexedDbWrapper.subCharacterTypes.bulkPut(data as FsSubCharacterType[]);
      await indexedDbWrapper.timeStamps.put({ name: name, timestamp: timestamp });
    } else if (name === FsCollectionName.Users) {
      // Do nothing.
      // await indexedDbWrapper.users.bulkPut(data as FsUser[]);
      // await indexedDbWrapper.timeStamps.put({ name: name, timestamp: timestamp });
    } else if (name === FsCollectionName.Versions) {
      await indexedDbWrapper.versions.bulkPut(data as FsVersion[]);
      await indexedDbWrapper.timeStamps.put({ name: name, timestamp: timestamp });
    } else if (name === FsCollectionName.VoiceActors) {
      await indexedDbWrapper.voiceActors.bulkPut(data as FsVoiceActor[]);
      await indexedDbWrapper.timeStamps.put({ name: name, timestamp: timestamp });
    } else if (name === FsCollectionName.Weapons) {
      await indexedDbWrapper.weapons.bulkPut(data as FsWeapon[]);
      await indexedDbWrapper.timeStamps.put({ name: name, timestamp: timestamp });
    } else {
      const error = new Error(`${location} Unsupported collection name. { name: ${name} }`);
      error.name = ErrorCode.BadRequest;
      throw error;
    }
  }

  async retrieveDataCollection(name: string): Promise<FsDocumentBase[]> {
    const location = `${IndexedDbWrapper.className}.retrieveDataCollection()`;
    let result: any[] = [];

    if (name === FsCollectionName.Abilities) {
      result = await indexedDbWrapper.abilities.toArray();
    } else if (name === FsCollectionName.Announces) {
      result = await indexedDbWrapper.announces.toArray();
    } else if (name === FsCollectionName.CharacterTags) {
      result = await indexedDbWrapper.characterTags.toArray();
    } else if (name === FsCollectionName.CharacterTypes) {
      result = await indexedDbWrapper.characterTypes.toArray();
    } else if (name === FsCollectionName.Characters) {
      result = await indexedDbWrapper.characters.toArray();
    } else if (name === FsCollectionName.Facilities) {
      result = await indexedDbWrapper.facilities.toArray();
    } else if (name === FsCollectionName.Illustrators) {
      result = await indexedDbWrapper.illustrators.toArray();
    } else if (name === FsCollectionName.SubCharacterTypes) {
      result = await indexedDbWrapper.subCharacterTypes.toArray();
    } else if (name === FsCollectionName.Users) {
      // Do nothing.
      //   result = await indexedDbWrapper.users.toArray();
    } else if (name === FsCollectionName.Versions) {
      result = await indexedDbWrapper.versions.toArray();
    } else if (name === FsCollectionName.VoiceActors) {
      result = await indexedDbWrapper.voiceActors.toArray();
    } else if (name === FsCollectionName.Weapons) {
      result = await indexedDbWrapper.weapons.toArray();
    } else {
      const error = new Error(`${location} Unsupported collection name. { name: ${name} }`);
      error.name = ErrorCode.BadRequest;
      throw error;
    }

    return result;
  }

  async getTimestamp(name: string): Promise<Date> {
    let record = await indexedDbWrapper.timeStamps.get(name);

    if (record) {
      return record.timestamp;
    } else {
      return new Date('2022-07-13T00:00:00+0900');
    }
  }

  //============================================================================
  // Private methods.
  //
}

export const indexedDbWrapper = new IndexedDbWrapper();
