export enum CharacterOwnershipStatusType {
  All = 'all',
  HasOnly = 'hasOnly',
  NotHasOnly = 'notHasOnly',
}

export const CharacterOwnershipStatusTypes: { label: string; value: CharacterOwnershipStatusType }[] = [
  { label: 'すべて', value: CharacterOwnershipStatusType.All },
  { label: '所持', value: CharacterOwnershipStatusType.HasOnly },
  { label: '未所持', value: CharacterOwnershipStatusType.NotHasOnly },
];

export class CharacterFilterSettings {
  ownershipStatusType: CharacterOwnershipStatusType = CharacterOwnershipStatusType.All;

  rarerities: number[] = [];

  weaponTypes: string[] = [];

  geographTypes: string[] = [];

  regins: string[] = [];
}
