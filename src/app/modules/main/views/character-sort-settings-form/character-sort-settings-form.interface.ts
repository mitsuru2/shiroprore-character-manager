import { AbilityAttrType } from 'src/app/services/firestore-data/firestore-document.interface';

export type CharacterSortIndexType = 'identifier' | 'rarerity' | 'weaponType' | 'implementedDate' | AbilityAttrType;
export type CharacterSortDirectionType = 'asc' | 'desc'; // asc: 昇順, desc: 降順

export const CharacterSortIndexTypes: { label: string; value: CharacterSortIndexType }[] = [
  { label: '図鑑Ｎｏ．', value: 'identifier' },
  { label: 'レアリティ', value: 'rarerity' },
  { label: '武器タイプ', value: 'weaponType' },
  { label: '実装日', value: 'implementedDate' },
];

export const CharacterSortAbilityAttrTypes: { label: string; value: AbilityAttrType }[] = [
  { label: '攻撃上昇(%)', value: 'attackUpPercent' },
  { label: '攻撃上昇(値)', value: 'attackUpFixedValue' },
  { label: '与ダメ上昇(%)', value: 'damageUpPercent' },
  { label: '射程上昇(%)', value: 'rangeUpPercent' },
  { label: '射程上昇(値)', value: 'rangeUpFixedValue' },
  { label: '再配置CT短縮(%)', value: 'shortSortieIntervalPercent' },
  { label: '計略CT短縮(%)', value: 'shortKeiryakuIntervalPercent' },
  { label: '敵攻撃低下(%)', value: 'attackDownPercent' },
  { label: '敵被ダメ上昇(%)', value: 'takenDamageUpPercent' },
  { label: '敵射程低下(%)', value: 'rangeDownPercent' },
  { label: 'ダメ計倍率(%)', value: 'mapWeapon' },
];

export const CharacterSortDirectionTypes: { label: string; value: CharacterSortDirectionType }[] = [
  { label: '昇順', value: 'asc' },
  { label: '降順', value: 'desc' },
];

export class CharacterSortSetting {
  indexType: CharacterSortIndexType = 'identifier';

  direction: CharacterSortDirectionType = 'asc';
}
