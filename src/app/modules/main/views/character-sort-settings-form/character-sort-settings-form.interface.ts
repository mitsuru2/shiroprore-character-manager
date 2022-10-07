import { AbilityAttrType } from 'src/app/services/firestore-data/firestore-document.interface';

export type CharacterSortIndexType = 'identifier' | 'rarerity' | 'weaponType' | 'implementedDate' | AbilityAttrType;
export type CharacterSortDirectionType = 'asc' | 'desc'; // asc: 昇順, desc: 降順

export const CharacterSortIndexTypes: { value: CharacterSortIndexType; label: string }[] = [
  { value: 'identifier', label: '図鑑Ｎｏ．' },
  { value: 'rarerity', label: 'レアリティ' },
  { value: 'weaponType', label: '武器タイプ' },
  { value: 'implementedDate', label: '実装日' },
];

export const CharacterSortAbilityAttrTypes: { value: AbilityAttrType; label: string }[] = [
  { value: 'AttackUpRate', label: '割合攻撃バフ' },
];

export const CharacterSortDirectionTypes: { value: CharacterSortDirectionType; label: string }[] = [
  { value: 'asc', label: '昇順' },
  { value: 'desc', label: '降順' },
];

export class CharacterSortSettings {
  indexType: CharacterSortIndexType = 'identifier';

  direction: CharacterSortDirectionType = 'asc';
}
