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
  { label: '攻撃上昇(%)', value: 'AttackUpPercent' },
  { label: '攻撃上昇(値)', value: 'AttackUpFixedValue' },
  { label: '与ダメ上昇(%)', value: 'DamageUpPercent' },
  { label: '射程上昇(%)', value: 'RangeUpPercent' },
  { label: '射程上昇(値)', value: 'RangeUpFixedValue' },
  { label: '再配置CT短縮(%)', value: 'ShortSortieIntervalPercent' },
  { label: '計略CT短縮(%)', value: 'ShortKeiryakuIntervalPercent' },
  { label: '敵攻撃低下(%)', value: 'AttackDownPercent' },
  { label: '敵被ダメ上昇(%)', value: 'TakenDamageUpPercent' },
  { label: '敵射程低下(%)', value: 'RangeDownPercent' },
  { label: 'ダメ計倍率(%)', value: 'MapWeapon' },
];

export const CharacterSortDirectionTypes: { label: string; value: CharacterSortDirectionType }[] = [
  { label: '昇順', value: 'asc' },
  { label: '降順', value: 'desc' },
];

export class CharacterSortSettings {
  indexType: CharacterSortIndexType = 'identifier';

  direction: CharacterSortDirectionType = 'asc';
}
