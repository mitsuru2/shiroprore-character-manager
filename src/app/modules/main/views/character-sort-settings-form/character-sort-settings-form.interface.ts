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
  { label: '攻撃バフ(%)', value: 'AttackUpRate' },
  { label: '与ダメバフ', value: 'DamageUpRate' },
  { label: '攻撃デバフ(%)', value: 'AttackDownRate' },
  { label: '被ダメデバフ', value: 'TakenDamageUpRate' },
];

export const CharacterSortDirectionTypes: { label: string; value: CharacterSortDirectionType }[] = [
  { label: '昇順', value: 'asc' },
  { label: '降順', value: 'desc' },
];

export class CharacterSortSettings {
  indexType: CharacterSortIndexType = 'identifier';

  direction: CharacterSortDirectionType = 'asc';
}
