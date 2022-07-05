import { FsWeaponType } from 'src/app/services/firestore-data/firestore-document.interface';

export enum NewWeaponFormMode {
  minimum,
  normal,
}

export class NewWeaponFormContent {
  type: FsWeaponType = new FsWeaponType();

  name: string = '';

  rarerity: number = 0;

  attack: number = 0;

  attackKai?: number;

  descriptions: string[] = [];

  effects: string[] = [];

  effectsKai: string[] = [];
}

export class NewWeaponFormResult {
  canceled: boolean = true;

  content?: NewWeaponFormContent;
}
