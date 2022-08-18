import { FieldValue, Timestamp } from '@angular/fire/firestore';

/**
 * Base data types.
 */
export class FsDocumentBase {
  id: string = '';

  name: string = '';

  createdAt: FieldValue = Timestamp.fromDate(new Date('2022-07-13T00:00:00+0900'));

  updatedAt: FieldValue = Timestamp.fromDate(new Date('2022-07-13T00:00:00+0900'));

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
export type MapCellType = '赤' | '青' | '赤青' | '舟' | 'なし';

export class FsAbility extends FsDocumentBase {
  type: string = '';

  descriptions: string[] = [];

  interval: number = 0;

  cost: number = 0;

  tokenLayouts: MapCellType[] = [];
}

export class FsAbilityType extends FsDocumentBaseWithOrder {
  isKeiryaku: boolean = false;

  constructor(id = '', name = '', order = 0, isKeiryaku = false) {
    super(id, name, order);
    this.isKeiryaku = isKeiryaku;
  }
}

export class FsCharacterTag extends FsDocumentBase {
  characters: string[] = [];
}

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
