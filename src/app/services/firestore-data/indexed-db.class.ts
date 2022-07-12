// eslint-disable-next-line import/no-named-as-default
import Dexie from 'dexie';
import { FsCollectionName } from './firestore-collection-name.enum';
import {
  FsAbility,
  FsCharacter,
  FsCharacterTag,
  FsCharacterType,
  FsFacility,
  FsIllustrator,
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
  [FsCollectionName.VoiceActors]: Dexie.Table<FsVoiceActor, number>;
  [FsCollectionName.Weapons]: Dexie.Table<FsWeapon, number>;
}

export class IndexedDb {
  static readonly dbName = 'ShiroproreCharacter';

  static db: Dexie = new Dexie(this.dbName);

  constructor() {}
}
