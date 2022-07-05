import { FsFacilityType } from 'src/app/services/firestore-data/firestore-document.interface';

export enum NewFacilityFormMode {
  minimum,
  normal,
}

export class NewFacilityFormContent {
  type: FsFacilityType = new FsFacilityType();

  name: string = '';

  rarerity: number = 0;

  descriptions: string[] = [];

  effects: string[] = [];

  details: string[] = [];
}

export class NewFacilityFormResult {
  canceled: boolean = true;

  content?: NewFacilityFormContent;
}
