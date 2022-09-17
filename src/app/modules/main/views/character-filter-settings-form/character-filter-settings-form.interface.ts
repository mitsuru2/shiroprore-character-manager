import { MapCellType } from 'src/app/services/firestore-data/firestore-document.interface';

export type CharacterOwnershipFilterType = 'all' | 'hasOnly' | 'notHasOnly';
export const CharacterOwnershipFilterTypeLabels: { label: string; value: CharacterOwnershipFilterType }[] = [
  { label: 'すべて', value: 'all' },
  { label: '所持', value: 'hasOnly' },
  { label: '未所持', value: 'notHasOnly' },
];

export type CharacterFilterOptionOthersType =
  | 'ownershipAbility'
  | 'teamAbility'
  | 'defeatedTimeAbility'
  | 'tokenRed'
  | 'tokenBlue'
  | 'tokenRedAndBlue';
export const CharacterFilterOptionOthersLabels: { label: string; value: CharacterFilterOptionOthersType }[] = [
  { label: '所持特技', value: 'ownershipAbility' },
  { label: '編成特技', value: 'teamAbility' },
  { label: '大破特技', value: 'defeatedTimeAbility' },
  { label: '伏兵(赤)', value: 'tokenRed' },
  { label: '伏兵(青)', value: 'tokenBlue' },
  { label: '伏兵(赤青)', value: 'tokenRedAndBlue' },
];

export class CharacterFilterSettings {
  ownershipFilterType: CharacterOwnershipFilterType = 'all';

  rarerities: number[] = [];

  weaponTypes: string[] = [];

  geographTypes: string[] = [];

  regions: string[] = [];

  tokenTypes: MapCellType[] = [];

  ownershipAbility: boolean = false;

  teamAbility: boolean = false;

  defeatedTimeAbility: boolean = false;

  startDate?: Date;

  endDate?: Date;
}
