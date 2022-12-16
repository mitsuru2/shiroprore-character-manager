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
  { label: '攻撃上昇(%)', value: 'attackUpPercent', defaultDirection: 'desc' },
  { label: '攻撃上昇(値)', value: 'attackUpFixedValue', defaultDirection: 'desc' },
  { label: '防御上昇(%)', value: 'defenceUpPercent', defaultDirection: 'desc' },
  { label: '防御上昇(値)', value: 'defenceUpFixedValue', defaultDirection: 'desc' },
  { label: '与ダメ上昇(%)', value: 'damageUpPercent', defaultDirection: 'desc' },
  { label: '射程上昇(%)', value: 'rangeUpPercent', defaultDirection: 'desc' },
  { label: '射程上昇(値)', value: 'rangeUpFixedValue', defaultDirection: 'desc' },
  { label: '再配置CT短縮(%)', value: 'shortSortieIntervalPercent', defaultDirection: 'desc' },
  { label: '計略CT短縮(%)', value: 'shortKeiryakuIntervalPercent', defaultDirection: 'desc' },
  { label: '敵攻撃低下(%)', value: 'attackDownPercent', defaultDirection: 'desc' },
  { label: '敵被ダメ上昇(%)', value: 'takenDamageUpPercent', defaultDirection: 'desc' },
  { label: '敵射程低下(%)', value: 'rangeDownPercent', defaultDirection: 'desc' },
  { label: 'ダメ計倍率(%)', value: 'mapWeapon', defaultDirection: 'desc' },
];

export const CharacterSortDirectionTypes: { label: string; value: CharacterSortDirectionType }[] = [
  { label: '昇順', value: 'asc' },
  { label: '降順', value: 'desc' },
];

export class CharacterSortSetting {
  indexType: CharacterSortIndexType = 'identifier';

  direction: CharacterSortDirectionType = 'asc';
}
