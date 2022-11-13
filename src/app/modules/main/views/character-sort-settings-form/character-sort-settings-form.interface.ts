import { AbilityAttrType } from 'src/app/services/firestore-data/firestore-document.interface';

export type CharacterSortIndexType = 'identifier' | 'rarerity' | 'weaponType' | 'implementedDate' | AbilityAttrType;
export type CharacterSortDirectionType = 'asc' | 'desc'; // asc: 昇順, desc: 降順

export const CharacterSortIndexTypes: { label: string; value: CharacterSortIndexType; defaultDirection: CharacterSortDirectionType }[] = [
  { label: '図鑑Ｎｏ．', value: 'identifier', defaultDirection: 'asc' },
  { label: 'レアリティ', value: 'rarerity', defaultDirection: 'desc' },
  { label: '武器タイプ', value: 'weaponType', defaultDirection: 'asc' },
  { label: '実装日', value: 'implementedDate', defaultDirection: 'asc' },
];

export const CharacterSortAbilityAttrTypes: { label: string; value: AbilityAttrType; defaultDirection: CharacterSortDirectionType }[] = [
  { label: '攻撃上昇(%)', value: 'AttackUpPercent', defaultDirection: 'desc' },
  { label: '攻撃上昇(値)', value: 'AttackUpFixedValue', defaultDirection: 'desc' },
  { label: '与ダメ上昇(%)', value: 'DamageUpPercent', defaultDirection: 'desc' },
  { label: '射程上昇(%)', value: 'RangeUpPercent', defaultDirection: 'desc' },
  { label: '射程上昇(値)', value: 'RangeUpFixedValue', defaultDirection: 'desc' },
  { label: '再配置CT短縮(%)', value: 'ShortSortieIntervalPercent', defaultDirection: 'desc' },
  { label: '計略CT短縮(%)', value: 'ShortKeiryakuIntervalPercent', defaultDirection: 'desc' },
  { label: '敵攻撃低下(%)', value: 'AttackDownPercent', defaultDirection: 'desc' },
  { label: '敵被ダメ上昇(%)', value: 'TakenDamageUpPercent', defaultDirection: 'desc' },
  { label: '敵射程低下(%)', value: 'RangeDownPercent', defaultDirection: 'desc' },
  { label: 'ダメ計倍率(%)', value: 'MapWeapon', defaultDirection: 'desc' },
];

export const CharacterSortDirectionTypes: { label: string; value: CharacterSortDirectionType }[] = [
  { label: '昇順', value: 'asc' },
  { label: '降順', value: 'desc' },
];

export class CharacterSortSetting {
  indexType: CharacterSortIndexType = 'identifier';

  direction: CharacterSortDirectionType = 'asc';
}
