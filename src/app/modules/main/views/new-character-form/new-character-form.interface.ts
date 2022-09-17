import { csCharacterImageTypes } from 'src/app/services/cloud-storage/cloud-storage.interface';
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

export class ImageDataWithProperty {
  data: Blob = new Blob();

  status: 'empty' | 'ready' | 'updated' = 'empty';

  constructor(imageData?: Blob) {
    if (imageData) {
      this.data = imageData;
      this.status = 'ready';
    }
  }

  setImageData(imageData: Blob) {
    this.data = imageData;
    this.status = 'updated';
  }
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

  implementedDate?: Date;

  abilities: FsAbilityForNewCharacterForm[] = [];

  abilitiesKai: FsAbilityForNewCharacterForm[] = [];

  imageFiles: ImageDataWithProperty[] = [];

  imageFilesKai: ImageDataWithProperty[] = [];

  thumbnailImage: ImageDataWithProperty = new ImageDataWithProperty();

  constructor() {
    for (let i = 0; i < csCharacterImageTypes.length; ++i) {
      this.imageFiles.push(new ImageDataWithProperty());
      this.imageFilesKai.push(new ImageDataWithProperty());
    }
  }
}
