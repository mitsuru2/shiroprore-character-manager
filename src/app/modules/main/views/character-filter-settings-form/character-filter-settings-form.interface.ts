import { AbilityAttrType, MapCellType } from 'src/app/services/firestore-data/firestore-document.interface';

export type CharacterOwnershipFilterType = 'all' | 'hasOnly' | 'notHasOnly';
export const CharacterOwnershipFilterTypeLabels: { label: string; value: CharacterOwnershipFilterType }[] = [
  { label: 'すべて', value: 'all' },
  { label: '所持', value: 'hasOnly' },
  { label: '未所持', value: 'notHasOnly' },
];

export type CharacterTypeFilterType = 'normal' | 'season' | 'kenran' | 'ura' | 'others';
export const CharacterTypeFilterTypeLabels: { label: string; value: CharacterTypeFilterType }[] = [
  { label: '通常', value: 'normal' },
  { label: '季節限定', value: 'season' },
  { label: '絢爛', value: 'kenran' },
  { label: '裏', value: 'ura' },
  { label: 'その他限定', value: 'others' },
];

export type CharacterFilterOptionOthersType =
  | 'ownershipAbility'
  | 'teamAbility'
  | 'defeatedTimeAbility'
  | 'tokenRed'
  | 'tokenBlue'
  | 'tokenRedAndBlue'
  | 'tokenWater';
export const CharacterFilterOptionAbilityTypeLabels: { label: string; value: CharacterFilterOptionOthersType }[] = [
  { label: '所持特技', value: 'ownershipAbility' },
  { label: '編成特技', value: 'teamAbility' },
  { label: '大破特技', value: 'defeatedTimeAbility' },
];
export const CharacterFilterOptionAbilityAttrLabels: { label: string; value: AbilityAttrType }[] = [
  { label: '割合攻撃バフ', value: 'AttackUpRate' },
];
export const CharacterFilterOptionTokenTypeLabels: { label: string; value: CharacterFilterOptionOthersType }[] = [
  { label: '伏兵(赤)', value: 'tokenRed' },
  { label: '伏兵(青)', value: 'tokenBlue' },
  { label: '伏兵(赤青)', value: 'tokenRedAndBlue' },
  { label: '伏兵(水上)', value: 'tokenWater' },
];

export class CharacterFilterSettings {
  ownershipFilterType: CharacterOwnershipFilterType = 'all';

  characterTypes: CharacterTypeFilterType[] = [];

  rarerities: number[] = [];

  weaponTypes: string[] = [];

  geographTypes: string[] = [];

  regions: string[] = [];

  tokenTypes: MapCellType[] = [];

  ownershipAbility: boolean = false;

  teamAbility: boolean = false;

  defeatedTimeAbility: boolean = false;

  abilityAttributes: AbilityAttrType[] = [];

  startDate?: Date;

  endDate?: Date;
}
