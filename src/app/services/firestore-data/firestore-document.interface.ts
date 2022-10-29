import { Timestamp } from '@angular/fire/firestore';

/**
 * Base data types.
 */
export class FsDocumentBase {
  id: string = '';

  name: string = '';

  createdAt: Timestamp = Timestamp.fromDate(new Date('2022-07-13T00:00:00+0900'));

  updatedAt: Timestamp = Timestamp.fromDate(new Date('2022-07-13T00:00:00+0900'));

  updatedBy: string = '';

  constructor(id = '', name = '') {
    this.id = id;
    this.name = name;
  }
}

export class FsDocumentBaseWithOrder extends FsDocumentBase {
  order: number = 0;

  constructor(id = '', name = '', order = 0) {
    super(id, name);
    this.order = order;
  }
}

export class FsDocumentBaseWithCode extends FsDocumentBase {
  code: string = '00';

  count: number = 0;

  constructor(id = '', name = '', code = '00') {
    super(id, name);
    this.code = code;
    this.count = 0;
  }
}

/**
 * Practical data types.
 */
export type MapCellType = '赤' | '青' | '赤青' | '水上' | 'なし';
export const abilityAttrTypes = [
  'AttackUpPercent',
  'AttackDownPercent',
  'DamageUpPercent',
  'TakenDamageUpPercent',
  'TakenDamageDownPercent',
  'ShortSortieIntervalPercent',
  'ShortKeiryakuIntervalPercent',
  'RangeUpFixedValue',
  'RangeUpPercent',
  'RangeDownPercent',
  'HideShiromusume',
  'HideToken',
  'HideWarehouse',
  'MapWeapon',
  'MapWeaponFire',
  'MapWeaponThunder',
  'MapWeaponRock',
  'MapWeaponWind',
  'MapWeaponIce',
  'MapWeaponWater',
  'MapWeaponPoison',
  'MapWeaponSeal',
  'MapWeaponOthers',
] as const;
export type AbilityAttrType = typeof abilityAttrTypes[number]; // <-- Define union data type from string const array.

export class FsAbilityAttribute {
  type: AbilityAttrType;

  value: number;

  isStepEffect: boolean = false;

  constructor(type: AbilityAttrType, value: number, isStepEffect: boolean = false) {
    this.type = type;
    this.value = value;
    this.isStepEffect = isStepEffect;
  }
}

export class FsAbility extends FsDocumentBase {
  type: string = '';

  descriptions: string[] = [];

  interval: number = 0;

  cost: number = 0;

  tokenLayouts: MapCellType[] = [];

  attributes: FsAbilityAttribute[] = [];
}

export class FsAbilityType extends FsDocumentBaseWithOrder {
  isKeiryaku: boolean = false;

  constructor(id = '', name = '', order = 0, isKeiryaku = false) {
    super(id, name, order);
    this.isKeiryaku = isKeiryaku;
  }
}

export class FsAnnounce extends FsDocumentBase {
  isActive: boolean = false;
}

export class FsCharacterTag extends FsDocumentBase {}

export class FsCharacterType extends FsDocumentBaseWithCode {
  weaponTypes: string[] = [];

  geographTypes: string[] = [];

  regions: string[] = [];

  isCostCalcEnable: boolean = false;

  isItem: boolean = false;

  isKaichikuEnable: boolean = false;

  hasSubTypes: boolean = false;
}

export class FsSubCharacterType extends FsDocumentBaseWithCode {
  parent = '';
}

export const FsCharacterRarerityMax = 7;

export class FsCharacter extends FsDocumentBase {
  index: string = '';

  type: string = '';

  subType: string = '';

  rarerity: number = 0;

  weaponType: string = '';

  geographTypes: string[] = [];

  region: string = '';

  cost: number = 0;

  costKai: number = 0;

  abilities: string[] = [];

  abilitiesKai: string[] = [];

  voiceActors: string[] = [];

  illustrators: string[] = [];

  motifWeapons: string[] = [];

  motifFacilities: string[] = [];

  tags: string[] = [];

  internalTags: string[] = []; // Tags which is not shown on the display. It is used for filtering.

  implementedDate?: Timestamp;
}

export class FsFacilityType extends FsDocumentBaseWithCode {}

export const FsFacilityRarerityMax = 5;

export class FsFacility extends FsDocumentBase {
  type: string = '';

  rarerity: number = 0;

  descriptions: string[] = [];

  effects: string[] = [];

  details: string[] = [];
}

export class FsGeographType extends FsDocumentBaseWithOrder {}

export class FsIllustrator extends FsDocumentBase {}

export class FsRegion extends FsDocumentBaseWithOrder {}

export class FsUser extends FsDocumentBase {
  characters: string[] = [];

  facilities: string[] = [];

  weapons: string[] = [];

  constructor(id = '', name = '') {
    super(id, name);
  }
}

export class FsVoiceActor extends FsDocumentBase {}

export class FsWeaponType extends FsDocumentBaseWithCode {
  baseCost: number = 0;

  isFixed = false;

  constructor(id = '', name = '', code = '', baseCost = 0, isFixed = false) {
    super(id, name, code);
    this.baseCost = baseCost;
    this.isFixed = isFixed;
  }
}

export const FsWeaponRarerityMax = 5;

export class FsWeapon extends FsDocumentBase {
  type: string = '';

  rarerity: number = 0;

  descriptions: string[] = [];

  attack: number = 0;

  attackKai: number = 0;

  effects: string[] = [];

  effectsKai: string[] = [];
}

export class FsVersion extends FsDocumentBase {
  descriptions: string[] = [];
}
