import { AbilityAttrType, MapCellType } from 'src/app/services/firestore-data/firestore-document.interface';

export const characterFilterOptions = [
  'ownershipStatus',
  'characterType',
  'rarerity',
  'weaponType',
  'geographType',
  'region',
  'tokenType',
  'ownershipAbility',
  'teamAbility',
  'defeatedTimeAbility',
  'abilityAttribute',
  'implementedDate',
] as const;
export type CharacterFilterOption = typeof characterFilterOptions[number]; // <-- Define union data type from string const array.

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
  { label: '攻撃上昇(%)', value: 'attackUpPercent' },
  { label: '攻撃上昇(値)', value: 'attackUpFixedValue' },
  { label: '防御上昇(%)', value: 'defenceUpPercent' },
  { label: '防御上昇(値)', value: 'defenceUpFixedValue' },
  { label: '与ダメ上昇(%)', value: 'damageUpPercent' },
  { label: '射程上昇(%)', value: 'rangeUpPercent' },
  { label: '射程上昇(値)', value: 'rangeUpFixedValue' },
  { label: '再配置CT短縮(%)', value: 'shortSortieIntervalPercent' },
  { label: '計略CT短縮(%)', value: 'shortKeiryakuIntervalPercent' },
  { label: '城娘隠密', value: 'hideShiromusume' },
  { label: '伏兵隠密', value: 'hideToken' },
  { label: '蔵隠密', value: 'hideWarehouse' },
  { label: '敵攻撃低下(%)', value: 'attackDownPercent' },
  { label: '敵被ダメ上昇(%)', value: 'takenDamageUpPercent' },
  { label: '敵射程低下(%)', value: 'rangeDownPercent' },
  { label: 'ダメ計(火)', value: 'mapWeaponFire' },
  { label: 'ダメ計(雷)', value: 'mapWeaponThunder' },
  { label: 'ダメ計(岩)', value: 'mapWeaponRock' },
  { label: 'ダメ計(風)', value: 'mapWeaponWind' },
  { label: 'ダメ計(水)', value: 'mapWeaponWater' },
  { label: 'ダメ計(氷)', value: 'mapWeaponIce' },
  { label: 'ダメ計(毒)', value: 'mapWeaponPoison' },
  { label: 'ダメ計(封)', value: 'mapWeaponSeal' },
  { label: 'ダメ計(他)', value: 'mapWeaponOthers' },
];
export const CharacterFilterOptionTokenTypeLabels: { label: string; value: CharacterFilterOptionOthersType }[] = [
  { label: '伏兵(赤)', value: 'tokenRed' },
  { label: '伏兵(青)', value: 'tokenBlue' },
  { label: '伏兵(赤青)', value: 'tokenRedAndBlue' },
  { label: '伏兵(水上)', value: 'tokenWater' },
];

export class CharacterFilterSetting {
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
