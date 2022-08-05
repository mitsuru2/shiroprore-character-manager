import { FsWeaponType } from 'src/app/services/firestore-data/firestore-document.interface';

export type NewWeaponFormMode = 'normal' | 'minimum';

export class NewWeaponFormData {
  type: FsWeaponType = new FsWeaponType();

  name: string = '';

  rarerity: number = 0;

  attack: number = 0;

  attackKai: number = 0;

  descriptions: string[] = [];

  effects: string[] = [];

  effectsKai: string[] = [];
}
