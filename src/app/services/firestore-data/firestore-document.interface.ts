/**
 * Base data types.
 */
export interface FsDocumentBase {
  id: string;
  name: string;
}

export interface FsDocumentBaseWithOrder extends FsDocumentBase {
  order: number;
}

export interface FsDocumentBaseWithCode extends FsDocumentBase {
  code: string;
  count: number;
}

/**
 * Practical data types.
 */
export class FsAbility implements FsDocumentBase {
  id = '';

  name = '';

  type: string = '';

  descriptions: string[] = [];

  interval: number = 0;

  cost: number = 0;

  tokenLayouts: string[] = [];
}

export class FsAbilityType implements FsDocumentBaseWithOrder {
  id = '';

  name = '';

  order = 0;
}

export class FsCharacterTag implements FsDocumentBase {
  id = '';

  name = '';

  characters: string[] = [];
}

export class FsCharacterType implements FsDocumentBaseWithCode {
  id = '';

  name = '';

  code = '';

  count = 0;

  weaponTypes: string[] = [];

  geographTypes: string[] = [];

  regions: string[] = [];

  isCostCalcEnable: boolean = false;

  isKaichikuEnable: boolean = false;

  hasSubTypes: boolean = false;

  subTypes: FsSubCharacterType[] = [];
}

export class FsSubCharacterType implements FsDocumentBaseWithCode {
  id = '';

  name = '';

  code = '00';

  count = 0;
}

export const FsCharacterRarerityMax = 7;

export class FsCharacter implements FsDocumentBase {
  id = '';

  name = '';

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

export class FsFacilityType implements FsDocumentBaseWithCode {
  id = '';

  name = '';

  code = '';

  count = 0;
}

export const FsFacilityRarerityMax = 5;

export class FsFacility implements FsDocumentBase {
  id = '';

  name = '';

  type: string = '';

  rarerity: number = 0;

  descriptions: string[] = [];

  effects: string[] = [];

  details: string[] = [];
}

export class FsGeographType implements FsDocumentBaseWithOrder {
  id = '';

  name = '';

  order = 0;
}

export class FsIllustrator implements FsDocumentBase {
  id = '';

  name = '';
}

export class FsRegion implements FsDocumentBaseWithOrder {
  id = '';

  name = '';

  order = 0;
}

export class FsVoiceActor implements FsDocumentBase {
  id = '';

  name = '';
}

export class FsWeaponType implements FsDocumentBaseWithCode {
  id = '';

  name = '';

  code = '';

  count = 0;

  baseCost: number = 0;
}

export const FsWeaponRarerityMax = 5;

export class FsWeapon implements FsDocumentBase {
  id = '';

  name = '';

  type: string = '';

  rarerity: number = 0;

  descriptions: string[] = [];

  attack: number = 0;

  attackKai: number = 0;

  effects: string[] = [];

  effectsKai: string[] = [];
}
