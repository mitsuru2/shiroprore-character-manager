import { FsFacilityType } from 'src/app/services/firestore-data/firestore-document.interface';

export type NewFacilityFormMode = 'normal' | 'minimum';

export class NewFacilityFormData {
  type: FsFacilityType = new FsFacilityType();

  name: string = '';

  rarerity: number = 0;

  descriptions: string[] = [];

  effects: string[] = [];

  details: string[] = [];
}
