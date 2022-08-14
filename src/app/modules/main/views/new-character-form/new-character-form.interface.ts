import {
  FsAbility,
  FsCharacterTag,
  FsCharacterType,
  FsFacility,
  FsGeographType,
  FsIllustrator,
  FsRegion,
  FsSubCharacterType,
  FsVoiceActor,
  FsWeapon,
  FsWeaponType,
} from 'src/app/services/firestore-data/firestore-document.interface';

export type NewCharacterFormMode = 'normal' | 'dataEdit' | 'imageEdit';

export class FsAbilityForNewCharacterForm extends FsAbility {
  typeName: string = '';

  tokenAvailable: boolean = false;

  isExisting: boolean = false;
}

export class NewCharacterFormData {
  characterType: FsCharacterType = new FsCharacterType();

  subCharacterType: FsSubCharacterType = new FsSubCharacterType();

  characterName: string = '';

  rarerity: number = 0;

  weaponType: FsWeaponType = new FsWeaponType();

  geographTypes: FsGeographType[] = [];

  region: FsRegion = new FsRegion();

  cost: number = 0;

  costKai: number = 0;

  voiceActor: FsVoiceActor = new FsVoiceActor();

  illustrator: FsIllustrator = new FsIllustrator();

  motifWeapons: FsWeapon[] = [];

  motifFacilities: FsFacility[] = [];

  characterTags: FsCharacterTag[] = [];

  abilities: FsAbilityForNewCharacterForm[] = [];

  abilitiesKai: FsAbilityForNewCharacterForm[] = [];

  imageFiles: Blob[] = [];

  imageFilesKai: Blob[] = [];

  thumbnailImage: Blob = new Blob();
}
