import { MapCellType } from 'src/app/services/firestore-data/firestore-document.interface';

export type CharacterOwnershipFilterType = 'all' | 'hasOnly' | 'notHasOnly';

export const CharacterOwnershipFilterTypeLabels: { label: string; value: CharacterOwnershipFilterType }[] = [
  { label: 'すべて', value: 'all' },
  { label: '所持', value: 'hasOnly' },
  { label: '未所持', value: 'notHasOnly' },
];

export class CharacterFilterSettings {
  ownershipFilterType: CharacterOwnershipFilterType = 'all';

  rarerities: number[] = [];

  weaponTypes: string[] = [];

  geographTypes: string[] = [];

  regions: string[] = [];

  tokenTypes: MapCellType[] = [];
}
