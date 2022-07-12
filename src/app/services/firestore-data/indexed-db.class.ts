// eslint-disable-next-line import/no-named-as-default
import Dexie, { DBCoreRangeType } from 'dexie';
import { FsCollectionName } from './firestore-collection-name.enum';
import {
  FsAbility,
  FsCharacter,
  FsCharacterTag,
  FsCharacterType,
  FsFacility,
  FsIllustrator,
  FsSubCharacterType,
  FsVoiceActor,
  FsWeapon,
} from './firestore-document.interface';

export type DexieDatabase = { [P in keyof Dexie]: Dexie[P] };

export interface ShiroproreDatabase extends DexieDatabase {
  [FsCollectionName.Abilities]: Dexie.Table<FsAbility, number>;
  [FsCollectionName.CharacterTags]: Dexie.Table<FsCharacterTag, number>;
  [FsCollectionName.CharacterTypes]: Dexie.Table<FsCharacterType, number>;
  [FsCollectionName.Characters]: Dexie.Table<FsCharacter, number>;
  [FsCollectionName.Facilities]: Dexie.Table<FsFacility, number>;
  [FsCollectionName.Illustrators]: Dexie.Table<FsIllustrator, number>;
  [FsCollectionName.SubCharacterTypes]: Dexie.Table<FsSubCharacterType, number>;
  [FsCollectionName.VoiceActors]: Dexie.Table<FsVoiceActor, number>;
  [FsCollectionName.Weapons]: Dexie.Table<FsWeapon, number>;
}

export class IndexedDb {
  static readonly dbName = 'ShiroproreCharacter';

  static db: Dexie = new Dexie(this.dbName) as ShiroproreDatabase;

  //============================================================================
  // Class methods.
  //
  constructor() {}

  //============================================================================
  // Private methods.
  //
  private setSchema() {
    IndexedDb.db.version(1).stores({
      [FsCollectionName.Abilities]: 'id, name, type',
    });
  }
}
