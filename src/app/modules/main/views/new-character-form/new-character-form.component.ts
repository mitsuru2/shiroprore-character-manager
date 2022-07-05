import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { CsCharacterImageTypeMax, csCharacterImageTypes } from 'src/app/services/cloud-storage/cloud-storage.interface';
import { FirestoreDataService } from 'src/app/services/firestore-data/firestore-data.service';
import {
  FsCharacterType,
  FsDocumentBase,
  FsGeographType,
  FsRegion,
  FsWeaponType,
  FsAbilityType,
  FsAbility,
  FsVoiceActor,
  FsIllustrator,
  FsWeapon,
  FsFacility,
  FsFacilityType,
  FsCharacterRarerityMax,
  FsCharacterTag,
  FsSubCharacterType,
  FsCharacter,
} from 'src/app/services/firestore-data/firestore-document.interface';
import { HtmlCanvas } from '../../utils/html-canvas/html-canvas.utility';
import { loadImageFile } from '../../utils/image-file/image-file.utility';
import { MakeThumbnailFormResult } from '../make-thumbnail-form/make-thumbnail-form.interface';
import { NewFacilityFormMode, NewFacilityFormResult } from '../new-facility-form/new-facility-form.interafce';
import { NewWeaponFormMode, NewWeaponFormResult } from '../new-weapon-form/new-weapon-form.interface';
import {
  FsAbilityForNewCharacterForm,
  NewCharacterFormContent,
  NewCharacterFormResult,
} from './new-character-form.interface';

@Component({
  selector: 'app-new-character-form',
  templateUrl: './new-character-form.component.html',
  styleUrls: ['./new-character-form.component.scss'],
})
export class NewCharacterFormComponent implements OnChanges {
  private className = 'NewCharacterFormComponent';

  /** Form Status */
  @Input() shown = false;

  /** Appearance. */
  @Input() maxWidth = 'auto';

  iconButtonWidth = 50; // px

  previewCanvasWidth = '300px';

  previewCanvasHeight = this.previewCanvasWidth;

  /** Button label and style. */
  @Input() okLabel = 'Ok';

  @Input() cancelLabel = 'Cancel';

  @Input() buttonStyleClass = '';

  /** Character Type */
  @Input() characterTypes!: FsCharacterType[];

  selectedCharacterType!: FsCharacterType; // Init at ngOnChanges().

  selectedSubCharacterType?: FsSubCharacterType;

  /** Character Name */
  @Input() characters!: FsCharacter[];

  inputCharacterName = '';

  /** Rearity */
  rarerityItems: number[] = []; // Itit at the constructor.

  selectedRarerity?: number;

  /** Weapon Type */
  @Input() weaponTypes!: FsWeaponType[]; // All weapon types list from the database.

  weaponTypeItems!: FsWeaponType[]; // Weapon types list filtered by the selected character type. Init at ngOnChanges().

  selectedWeaponType?: FsWeaponType;

  /** Geograph type. */
  @Input() geographTypes!: FsGeographType[]; // All geograph types list from the database.

  geographTypeItems!: FsGeographType[]; // Geograph types list filtered by the selected character type. Init at ngOnChanges().

  selectedGeographTypes: FsGeographType[] = [];

  /** Region. */
  @Input() regions!: FsRegion[]; // All reagions list from the database.

  regionItems!: FsRegion[]; // Regions list filtered by the selected character type. Init at ngOnChanges().

  selectedRegion?: FsRegion;

  /** Cost */
  inputCharacterCost = 0;

  inputCharacterCostKai = 0;

  /** Voice actor. */
  @Input() voiceActors!: FsVoiceActor[];

  suggestVoiceActorNames: string[] = [];

  inputVoiceActor: FsVoiceActor = new FsVoiceActor();

  /** Illustrator. */
  @Input() illustrators!: FsIllustrator[];

  suggestIllustratorNames: string[] = [];

  inputIllustrator: FsIllustrator = new FsIllustrator();

  /** Motif weapons */
  @Input() weapons!: FsWeapon[];

  inputMotifWeapons: string[] = [];

  /** New weapon form. */
  weaponFormMode = NewWeaponFormMode.minimum;

  initialWeaponName = '';

  showWeaponForm = false;

  /** Motif facilities. */
  @Input() facilities!: FsFacility[];

  inputMotifFacilities: string[] = [];

  /** New facility form. */
  @Input() facilityTypes!: FsFacilityType[];

  facilityFormMode = NewFacilityFormMode.minimum;

  initialFacilityName = '';

  showFacilityForm = false;

  /** Tags. */
  @Input() characterTags!: FsCharacterTag[];

  inputCharacterTags: string[] = [];

  /** Ability Type */
  @Input() abilityTypes!: FsAbilityType[];

  selectedAbilityTypes: FsAbilityType[] = [];

  selectedAbilityTypesKai: FsAbilityType[] = [];

  keiryakuTypeId!: string;

  /** Ability */
  @Input() abilities!: FsAbility[];

  suggestAbilityNames: string[][] = [];

  suggestAbilityNamesKai: string[][] = [];

  inputAbilities: FsAbilityForNewCharacterForm[] = [];

  inputAbilitiesKai: FsAbilityForNewCharacterForm[] = [];

  abilityFormMax = 8;

  /** Validation */
  isFormValid = true;

  errorMessage: string = '';

  /** Shiromusume images. */
  imageTypesAndLabels = csCharacterImageTypes;

  imageTypeMax: number = CsCharacterImageTypeMax;

  inputImageFiles: any[] = Array(this.imageTypeMax);

  inputImageFilesKai: any[] = Array(this.imageTypeMax);

  imageLoadFlags: boolean[] = Array(this.imageTypeMax);

  imageLoadFlagsKai: boolean[] = Array(this.imageTypeMax);

  /** Thumbnail image dialog. */
  showMakeThumbnailDialog = false;

  thumbnailBlob?: Blob;

  /** Output character data. */
  @Output() formResult = new EventEmitter<NewCharacterFormResult>();

  //============================================================================
  // Class methods.
  //
  constructor(private logger: NGXLogger, private firestore: FirestoreDataService) {
    this.logger.trace(`new ${this.className}()`);

    // Initialize rarerity list.
    for (let i = 0; i < FsCharacterRarerityMax; ++i) {
      this.rarerityItems.push(i + 1);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Clear input values when dialog is shown.
    if (changes['shown']) {
      if (changes['shown'].currentValue === true) {
        this.clearForm();
      }
    }

    // Character type.
    this.firestore.sortByCode(this.characterTypes);
    this.selectedCharacterType = this.characterTypes[0];

    // Sub character type.
    for (let i = 0; i < this.characterTypes.length; ++i) {
      if (this.characterTypes[i].subTypes) {
        this.firestore.sortByCode(this.characterTypes[i].subTypes as FsSubCharacterType[]);
      }
    }

    // Weapon type.
    this.weaponTypeItems = this.makeFilteredFormItems(this.selectedCharacterType.weaponTypes, this.weaponTypes);
    this.firestore.sortByCode(this.weaponTypeItems);

    // Geograph type.
    this.geographTypeItems = this.makeFilteredFormItems(this.selectedCharacterType.geographTypes, this.geographTypes);
    this.firestore.sortByOrder(this.geographTypeItems);

    // Region.
    if (this.selectedCharacterType.regions) {
      this.regionItems = this.makeFilteredFormItems(this.selectedCharacterType.regions, this.regions);
      this.firestore.sortByOrder(this.regionItems);
    }

    // Ability type.
    this.firestore.sortByOrder(this.abilityTypes);

    // Get keiryaku ability type.
    for (let i = 0; i < this.abilityTypes.length; ++i) {
      if (this.abilityTypes[i].name === '計略') {
        this.keiryakuTypeId = this.abilityTypes[i].id;
        break;
      }
    }
  }

  onCharacterTypeChanged() {
    this.logger.trace(`${this.className}.onCharacterTypeChanged()`);

    // Clear form except character type.
    this.clearForm(['characterType']);

    // Update weapon type item list.
    this.weaponTypeItems = this.makeFilteredFormItems(this.selectedCharacterType.weaponTypes, this.weaponTypes);
    this.firestore.sortByCode(this.weaponTypeItems);
    if (this.weaponTypeItems.length === 1) {
      this.selectedWeaponType = this.weaponTypeItems[0];
    }

    // Update geograph type item list.
    this.geographTypeItems = this.makeFilteredFormItems(this.selectedCharacterType.geographTypes, this.geographTypes);
    this.firestore.sortByOrder(this.geographTypeItems);
    if (this.geographTypeItems.length === 1) {
      this.selectedGeographTypes = [this.geographTypeItems[0]];
    }

    // Update region item list.
    if (this.selectedCharacterType.regions) {
      this.regionItems = this.makeFilteredFormItems(this.selectedCharacterType.regions, this.regions);
      this.firestore.sortByOrder(this.regionItems);
      if (this.regionItems.length === 1) {
        this.selectedRegion = this.regionItems[0];
      }
    }
  }

  onChipInputAdd(event: any) {
    const location = `${this.className}.onChipInputAdd()`;
    this.logger.trace(location);

    const inputId = event.originalEvent.target.id;
    let value = event.value;

    // Switch process by target input element.
    // Case: Motif weapon.
    if (inputId === 'NewCharacterForm_MotifWeaponInput') {
      this.onMotifWeaponInputAdd('NewCharacterForm_MotifFacilityInput', value);
    }

    // Case: Motif facility.
    else if (inputId === 'NewCharacterForm_MotifFacilityInput') {
      this.onMotifFacilityInputAdd('NewCharacterForm_MotifFacilityInput', value);
    }

    // Case: Character tags.
    else if (inputId === 'NewCharacterForm_CharacterTagInput') {
      this.onCharacterTagInputAdd('NewCharacterForm_CharacterTagInput', value);
    }
  }

  onAutofillInputChange(event: any) {
    const location = `${this.className}.onAutofillInputChange()`;
    this.logger.trace(location);

    const inputId = event.originalEvent.target.id;
    const query = event.query;

    // CASE: Voice actor input.
    if (inputId === 'NewCharacterForm_VoiceActorInput') {
      // Update suggestion item list.
      this.suggestVoiceActorNames = this.makeSuggestLabels(
        query,
        this.voiceActors.map((item) => item.name)
      );
    }

    // CASE: Illustrator input.
    else if (inputId === 'NewCharacterForm_IllustratorInput') {
      // Update suggestion item list.
      this.suggestIllustratorNames = this.makeSuggestLabels(
        query,
        this.illustrators.map((item) => item.name)
      );
    }

    // CASE: Ablity name input.
    else if (inputId.indexOf('NewCharacterForm_AbilityNameInput_') >= 0) {
      // Update suggestion item list.
      const index = Number(inputId.substring(inputId.lastIndexOf('_') + 1));
      this.suggestAbilityNames[index] = this.makeSuggestLabels(
        query,
        this.abilities.map((item) => item.name)
      );

      // Clear existing flag.
      this.inputAbilities[index].isExisting = false;

      // If the input value is the same as an existing name,
      // it will do the same as if an autofill candidate was selected.
      this.onAutofillInputSelect(query, inputId);
    }

    // CASE: Ablity name input (Kai).
    else if (inputId.indexOf('NewCharacterForm_AbilityNameKaiInput_') >= 0) {
      // Update suggestion item list.
      const index = Number(inputId.substring(inputId.lastIndexOf('_') + 1));

      // Add input ability names to the suggest candidates.
      let tmpAbilityNames = this.abilities.map((item) => item.name);
      for (let i = 0; i < this.inputAbilities.length; ++i) {
        if (tmpAbilityNames.includes(this.inputAbilities[i].name) === false) {
          tmpAbilityNames.push(this.inputAbilities[i].name);
        }
      }

      // Make suggest ability name list.
      this.suggestAbilityNamesKai[index] = this.makeSuggestLabels(query, tmpAbilityNames);

      // Clear existing flag.
      this.inputAbilitiesKai[index].isExisting = false;

      // If the input value is the same as an existing name,
      // it will do the same as if an autofill candidate was selected.
      this.onAutofillInputSelect(query, inputId);
    }
  }

  onAutofillInputSelect(value: any, inputId: string) {
    const location = `${this.className}.onAutoFillInputSelect()`;
    this.logger.trace(location, { value: value, inputId: inputId });

    if (inputId === 'NewCharacterForm_VoiceActorInput') {
      // Do nothing.
    } else if (inputId === 'NewCharacterForm_IllustratorInput') {
      // Do nothing.
    }

    // CASE: Ability names
    else if (inputId.indexOf('NewCharacterForm_AbilityNameInput_') >= 0) {
      const index = Number(inputId.substring(inputId.lastIndexOf('_') + 1));

      // Search ability info and copy it to input ability info.
      for (let ability of this.abilities) {
        if (ability.name === value) {
          this.inputAbilities[index] = this.makeFsAbilityForNewCharacterForm(ability);
          // Search ablity type and copy it to selected ability type.
          for (let abilityType of this.abilityTypes) {
            if (ability.type === abilityType.id) {
              this.selectedAbilityTypes[index] = abilityType;
              break;
            }
          }
          break;
        }
      }
    }

    // CASE: Ability name (Kai)
    else if (inputId.indexOf('NewCharacterForm_AbilityNameKaiInput_') >= 0) {
      const index = Number(inputId.substring(inputId.lastIndexOf('_') + 1));
      let found = false;

      // Search ability info and copy it to input ability info.
      for (let ability of this.abilities) {
        if (ability.name === value) {
          this.inputAbilitiesKai[index] = this.makeFsAbilityForNewCharacterForm(ability);
          // Search ablity type and copy it to selected ability type.
          for (let abilityType of this.abilityTypes) {
            if (ability.type === abilityType.id) {
              this.selectedAbilityTypesKai[index] = abilityType;
              break;
            }
          }
          found = true;
          break;
        }
      }

      // Search ability from input ability list.
      if (!found) {
        for (let i = 0; i < this.inputAbilities.length; ++i) {
          if (this.inputAbilities[i].name === value) {
            this.inputAbilitiesKai[index] = this.makeFsAbilityForNewCharacterForm(this.inputAbilities[i]);
            this.selectedAbilityTypesKai[index] = this.selectedAbilityTypes[i];
          }
        }
      }
    }
  }

  onAddAbilityButtonClick(kai: boolean) {
    const location = `${this.className}.onAddAbilityButtonClick()`;
    this.logger.trace(location, { kai: kai });

    // CASE: Before kaichiku.
    if (!kai) {
      this.selectedAbilityTypes.push(this.abilityTypes[0]);
      this.suggestAbilityNames.push([]);
      this.inputAbilities.push(this.makeFsAbilityForNewCharacterForm());
    }

    // CASE: After kaichiku.
    else {
      this.selectedAbilityTypesKai.push(this.abilityTypes[0]);
      this.suggestAbilityNamesKai.push([]);
      this.inputAbilitiesKai.push(this.makeFsAbilityForNewCharacterForm());
    }
  }

  onRemoveAbilityButtonClick(kai: boolean, index: number) {
    const location = `${this.className}.onAddAbilityButtonClick()`;
    this.logger.trace(location, { kai: kai, index: index });

    // CASE: Before kaichiku.
    if (!kai) {
      this.selectedAbilityTypes.splice(index, 1);
      this.suggestAbilityNames.splice(index, 1);
      this.inputAbilities.splice(index, 1);
    }

    // CASE: After kaichiku.
    else {
      this.selectedAbilityTypesKai.splice(index, 1);
      this.suggestAbilityNamesKai.splice(index, 1);
      this.inputAbilitiesKai.splice(index, 1);
    }
  }

  onNewWeaponDialogResult(formResult: NewWeaponFormResult) {
    const location = `${this.className}.onNewWeaponDialogResult()`;
    this.logger.trace(location, { formResult: formResult });

    // Import form result to motif weapon field.
    if (!formResult.canceled && formResult.content) {
      const content = formResult.content;
      const weaponText = `${content.rarerity.toString()}|${content.type.name}|${content.name}`;
      this.inputMotifWeapons.push(weaponText);
    }

    // Reset GUI focus to the motif weapon input.
    const element = document.getElementById('NewCharacterForm_MotifWeaponInput');
    if (element != undefined) {
      element.focus();
    }

    // Close dialog.
    this.showWeaponForm = false;
  }

  onNewFacilityFormResult(formResult: NewFacilityFormResult) {
    const location = `${this.className}.onNewFacilityFormResult()`;
    this.logger.trace(location, { formResult: formResult });

    // Import form result to motif weapon field.
    if (!formResult.canceled && formResult.content) {
      const content = formResult.content;
      const facilityText = `${content.rarerity.toString()}|${content.type.name}|${content.name}`;
      this.inputMotifFacilities.push(facilityText);
    }

    // Reset GUI focus to the motif weapon input.
    const element = document.getElementById('NewCharacterForm_MotifFacilityInput');
    if (element != undefined) {
      element.focus();
    }

    // Close dialog.
    this.showFacilityForm = false;
  }

  onInputImageFileChange(index: number, kaichiku: boolean, event: Event) {
    const location = `${this.className}.onInputImageFileChange()`;
    this.logger.trace(location, { index: index, kaichiku: kaichiku, event: event });

    const input = event.target as HTMLInputElement;
    let elemId = `NewCharacterForm_${this.imageTypesAndLabels[index].type}Preview`;
    elemId += kaichiku ? 'Kai' : '';

    if (!input.files) {
      this.logger.warn(location, 'No file is selected.');
      return;
    }

    if (!kaichiku) {
      this.imageLoadFlags[index] = false;
      this.inputImageFiles[index] = input.files[0];
    } else {
      this.imageLoadFlagsKai[index] = false;
      this.inputImageFilesKai[index] = input.files[0];
    }

    let promise = loadImageFile(input.files[0]);
    promise.then((result) => {
      const canvas = HtmlCanvas.createCanvas(elemId);
      if (!canvas) {
        this.logger.error(location, 'Canvas is not available.');
        return;
      }

      canvas.width = result.height;
      canvas.height = result.height;
      const offsetX = (result.height - result.width) / 2;
      canvas.drawImage(result, offsetX, 0);

      if (!kaichiku) {
        this.imageLoadFlags[index] = true;
      } else {
        this.imageLoadFlagsKai[index] = true;
      }

      // Clear element value in order to trigger events even if user select the same file.
      input.value = '';
    });
  }

  onRemoveImageFileClick(index: number, kaichiku: boolean) {
    const location = `${this.className}.onRemoveImageFileClick()`;
    this.logger.trace(location, { index: index, kaichiku: kaichiku });

    if (!kaichiku) {
      this.inputImageFiles[index] = undefined;
      this.imageLoadFlags[index] = false;
    } else {
      this.inputImageFilesKai[index] = undefined;
      this.imageLoadFlagsKai[index] = false;
    }
  }

  onMakeThumbnailFormClick() {
    const location = `${this.className}.onMakeThumbnailFormClick()`;
    this.logger.trace(location);

    this.showMakeThumbnailDialog = true;
  }

  onMakeThumbnailFormResult(thumbResult: MakeThumbnailFormResult) {
    const location = `${this.className}.onMakeThumbnailFormResult()`;
    this.logger.trace(location, { canceld: thumbResult.canceled });

    if (!thumbResult.canceled) {
      this.thumbnailBlob = thumbResult.thumb;
      if (this.thumbnailBlob) {
        const promise = loadImageFile(this.thumbnailBlob);
        promise.then((result) => {
          let canvas = HtmlCanvas.createCanvas('NewCharacterForm_ThumbnailPreview');
          if (!canvas) {
            this.logger.error(location, 'Canvas is not availale.');
            return;
          }
          canvas.width = result.width;
          canvas.height = result.height;
          canvas.drawImage(result, 0, 0);
        });
      }
    }

    this.showMakeThumbnailDialog = false;
  }

  onOkClick() {
    this.validateForm();
    if (this.isFormValid) {
      this.formResult.emit(this.makeCharacterInfo(false));
    } else {
      this.scrollToTop();
    }
  }

  onCancelClick() {
    this.formResult.emit(this.makeCharacterInfo(true));
  }

  /**
   * Track function which is used by *ngFor directive.
   * *ngFor cannot calculate index number when it's used with [(ngModel)].
   * So, this function help *ngFor to calculate index.
   * @param index Item index.
   * @param obj List object. Not used.
   * @returns Item index.
   */
     trackByItem(index: number, obj: any): any { // eslint-disable-line
    return index;
  }

  //============================================================================
  // Class private methods.
  //
  private onMotifWeaponInputAdd(inputId: string, value: string) {
    // Get index.
    const index = this.inputMotifWeapons.findIndex((item) => item === value);
    if (index < 0) {
      this.logger.error(location, 'Input text is not included in the binded variable.', { inputId: inputId });
      throw Error(`Input text is not included in the binded variable. { inputId: ${inputId} }`);
    }

    // Remove forbidden character if it includes one.
    if (value.includes('|')) {
      this.logger.warn(location, 'Forbidden character is found.', { value: value });
      value = value.replace(/\|/g, '');
      this.inputMotifWeapons[index] = value;
    }

    // Open new weapon form if input motif weapon name is new.
    if (this.weapons.findIndex((item) => item.name === value) < 0) {
      this.inputMotifWeapons.splice(index);
      this.initialWeaponName = value;
      this.showWeaponForm = true;
    }
  }

  private onMotifFacilityInputAdd(inputId: string, value: string) {
    // Get index.
    const index = this.inputMotifFacilities.findIndex((item) => item === value);
    if (index < 0) {
      this.logger.error(location, 'Input text is not included in the binded variable.', { inputId: inputId });
      throw Error(`Input text is not included in the binded variable. { inputId: ${inputId} }`);
    }

    // Remove forbidden character if it includes one.
    if (value.includes('|')) {
      this.logger.warn(location, 'Forbidden character is found.', { value: value });
      value = value.replace(/\|/g, '');
      this.inputMotifFacilities[index] = value;
    }

    // Open new weapon form if input motif weapon name is new.
    if (this.facilities.findIndex((item) => item.name === value) < 0) {
      this.inputMotifFacilities.splice(index);
      this.initialFacilityName = value;
      this.showFacilityForm = true;
    }
  }

  private onCharacterTagInputAdd(inputId: string, value: string) {
    // Get index.
    const index = this.inputCharacterTags.findIndex((item) => item === value);
    if (index < 0) {
      this.logger.error(location, 'Input text is not included in the binded variable.', { inputId: inputId });
      throw Error(`Input text is not included in the binded variable. { inputId: ${inputId} }`);
    }

    // Remove forbidden character if it includes one.
    if (value.includes('|')) {
      this.logger.warn(location, 'Forbidden character is found.', { value: value });
      value = value.replace(/\|/g, '');
      this.inputCharacterTags[index] = value;
    }

    // Add '|new' to the added token if it's new character tag.
    if (this.characterTags.findIndex((item) => item.name === value) < 0) {
      this.inputCharacterTags[index] += '|new';
    }
  }

  private makeFilteredFormItems<T extends FsDocumentBase>(filter: string[], fsData: T[]): T[] {
    const location = `${this.className}.makeFilteredFormItems2()`;
    this.logger.trace(location);

    const items: T[] = [];

    // Add item if it's included in the filter.
    for (let d of fsData) {
      if (filter.includes(d.id)) {
        items.push(d);
      }
    }

    return items;
  }

  private clearForm(exceptItems: string[] = []) {
    const location = `${this.className}.clearAll()`;
    this.logger.trace(location);

    if (exceptItems.includes('characterType') === false) {
      this.selectedCharacterType = this.characterTypes[0];
    }
    if (exceptItems.includes('subCharacterType') === false) {
      this.selectedSubCharacterType = undefined;
    }
    if (exceptItems.includes('characterName') === false) {
      this.inputCharacterName = '';
    }
    if (exceptItems.includes('rarerity') === false) {
      this.selectedRarerity = undefined;
    }
    if (exceptItems.includes('weaponType') === false) {
      this.selectedWeaponType = undefined;
    }
    if (exceptItems.includes('geographType') === false) {
      this.selectedGeographTypes = [];
    }
    if (exceptItems.includes('region') === false) {
      this.selectedRegion = undefined;
    }
    if (exceptItems.includes('voiceActor') === false) {
      this.inputVoiceActor.name = '';
    }
    if (exceptItems.includes('illustrator') === false) {
      this.inputIllustrator.name = '';
    }
    if (exceptItems.includes('motifWeapon') === false) {
      this.inputMotifWeapons = [];
    }
    if (exceptItems.includes('motifFacility') === false) {
      this.inputMotifFacilities = [];
    }
    if (exceptItems.includes('characterTag') === false) {
      this.inputCharacterTags = [];
    }
    if (exceptItems.includes('ability') === false) {
      this.selectedAbilityTypes = [];
      this.selectedAbilityTypesKai = [];
      this.inputAbilities = [];
      this.inputAbilitiesKai = [];
    }

    if (exceptItems.includes('images') === false) {
      for (let i = 0; i < this.imageTypeMax; ++i) {
        this.imageLoadFlags[i] = false;
        this.inputImageFiles[i] = undefined;
        this.imageLoadFlagsKai[i] = false;
        this.inputImageFilesKai[i] = undefined;
        this.thumbnailBlob = undefined;
      }
    }
  }

  private makeFsAbilityForNewCharacterForm(base?: FsAbility): FsAbilityForNewCharacterForm {
    const result = new FsAbilityForNewCharacterForm();

    if (base) {
      // Base FsAbility info.
      result.id = base.id;
      result.type = base.type;
      result.name = base.name;
      result.descriptions = base.descriptions;
      result.interval = base.interval;
      result.cost = base.cost;
      result.tokenLayouts = base.tokenLayouts;

      // Extended info.
      for (let i = 0; i < this.abilityTypes.length; ++i) {
        if (base.type === this.abilityTypes[i].id) {
          result.typeName = this.abilityTypes[i].name;
          break;
        }
      }
      result.tokenAvailable = base.tokenLayouts.length > 0 ? true : false;
      result.isExisting = true;
    }

    while (result.descriptions.length < 3) {
      result.descriptions.push('');
    }

    return result;
  }

  private makeSuggestLabels(value: string, source: string[]): string[] {
    //const locatin = `${this.className}.makeSuggestLabels()`;
    const suggests: string[] = [];

    for (let i = 0; i < source.length; ++i) {
      if (source[i].toLowerCase().indexOf(value.toLowerCase()) >= 0) {
        suggests.push(source[i]);
      }
    }

    return suggests;
  }

  private makeCharacterInfo(canceled: boolean): NewCharacterFormResult {
    const location = `${this.className}.makeCharacterInfo()`;
    const result: NewCharacterFormResult = <NewCharacterFormResult>{};

    // When the form is canceled, it returns canceled flag only.
    if (canceled) {
      result.canceled = true;
    }

    // When the form is input, it returns input weapon data.
    else {
      const content = new NewCharacterFormContent();

      // The mandatory input fields must not be null or undefined.
      // Input value validation shall be implemented at template.
      if (
        !this.selectedCharacterType ||
        this.inputCharacterName === '' ||
        !this.selectedRarerity ||
        !this.selectedWeaponType ||
        !this.selectedGeographTypes
      ) {
        this.logger.error(location, 'Necessary field is not input.', {
          type: this.selectedCharacterType,
          name: this.inputCharacterName,
          rarerity: this.selectedRarerity,
          weapon: this.selectedWeaponType,
          geographType: this.selectedGeographTypes,
        });
        throw Error(`${location} Necessary field is not input.`);
      }

      // Make character data to be returned.
      // Cancel flag.
      result.canceled = false;

      // Type, name, rarerity, weapon type, geograph type, and region.
      content.characterType = this.selectedCharacterType;
      content.characterName = this.inputCharacterName;
      content.rarerity = this.selectedRarerity;
      content.weaponType = this.selectedWeaponType;
      content.geographTypes = this.selectedGeographTypes;
      if (this.selectedRegion) {
        content.region = this.selectedRegion;
      }

      // Sub character type.
      if (content.characterType.subTypes.length > 0 && this.selectedSubCharacterType) {
        content.subCharacterType = this.selectedSubCharacterType;
      }

      // Character cost.
      content.cost = this.calcCharacterCost(
        this.selectedCharacterType,
        this.selectedWeaponType,
        this.inputAbilities,
        this.inputAbilitiesKai,
        false
      );
      content.costKai = this.calcCharacterCost(
        this.selectedCharacterType,
        this.selectedWeaponType,
        this.inputAbilities,
        this.inputAbilitiesKai,
        true
      );

      // Voice actor.
      if (this.inputVoiceActor.name !== '') {
        content.voiceActor.name = this.inputVoiceActor.name;
        for (let i = 0; i < this.voiceActors.length; ++i) {
          if (this.inputVoiceActor.name === this.voiceActors[i].name) {
            content.voiceActor = this.voiceActors[i];
            break;
          }
        }
      }

      // Illustrator.
      if (this.inputIllustrator.name !== '') {
        content.illustrator.name = this.inputIllustrator.name;
        for (let i = 0; i < this.illustrators.length; ++i) {
          if (this.inputIllustrator.name === this.illustrators[i].name) {
            content.illustrator = this.illustrators[i];
            break;
          }
        }
      }

      // Motif weapon.
      for (let i = 0; i < this.inputMotifWeapons.length; ++i) {
        content.motifWeapons.push(this.makeWeaponDataFromInputText(this.inputMotifWeapons[i]));
      }

      // Motif facility.
      for (let i = 0; i < this.inputMotifFacilities.length; ++i) {
        content.motifFacilities.push(this.makeFacilityDataFromInputText(this.inputMotifFacilities[i]));
      }

      // Character tag.
      for (let i = 0; i < this.inputCharacterTags.length; ++i) {
        content.characterTags.push(this.makeCharacterTagDataFromInputText(this.inputCharacterTags[i]));
      }

      // Ability type and ability.
      {
        // Copy ability info.
        for (let i = 0; i < this.inputAbilities.length; ++i) {
          content.abilities.push(
            this.makeAbilityInfoForFormResult(this.inputAbilities[i], this.selectedAbilityTypes[i])
          );
        }
        for (let i = 0; i < this.inputAbilitiesKai.length; ++i) {
          content.abilitiesKai.push(
            this.makeAbilityInfoForFormResult(this.inputAbilitiesKai[i], this.selectedAbilityTypesKai[i])
          );
        }
      }

      // Image files (include thumbnail).
      {
        // Make image file array.
        content.imageFiles = Array(this.imageTypeMax);
        content.imageFilesKai = Array(this.imageTypeMax);

        // Copy input image files.
        for (let i = 0; i < this.imageTypeMax; ++i) {
          if (this.inputImageFiles[i]) {
            content.imageFiles[i] = this.inputImageFiles[i];
          }
          if (this.inputImageFilesKai[i]) {
            content.imageFilesKai[i] = this.inputImageFilesKai[i];
          }
        }

        // Thumbnail.
        if (this.thumbnailBlob) {
          content.thumbnailImage = this.thumbnailBlob;
        }
      }

      result.content = content;
    }

    return result;
  }

  private calcCharacterCost(
    characterType: FsCharacterType,
    weaponType: FsWeaponType,
    abilities: FsAbility[],
    abilitiesKai: FsAbility[],
    kaichiku: boolean
  ): number {
    // const location = `${this.className}.calcCharacterCost()`;

    // CASE: Cost calcuration is disable.
    // It returns input cost value.
    if (!characterType.isCostCalcEnable) {
      if (!kaichiku) {
        return this.inputCharacterCost;
      } else {
        return this.inputCharacterCostKai;
      }
    }

    // CASE: Cost calcuration is enable.
    // Get the base cost from weapon type.
    let cost = weaponType.baseCost;

    // Check the character has keiryaku or not.
    let hasKeiryaku = false;
    let hasKeiryakuKai = false;
    for (let ability of abilities) {
      if (ability.type === this.keiryakuTypeId) {
        hasKeiryaku = true;
        break;
      }
    }
    for (let ability of abilitiesKai) {
      if (ability.type === this.keiryakuTypeId) {
        hasKeiryakuKai = true;
        break;
      }
    }

    // Calculate character cost.
    if (hasKeiryaku) {
      cost += 2;
    } else if (hasKeiryakuKai) {
      cost += 1;
    } else {
      // Do nothing.
    }

    // Kaichiku decreases character cost by 1.
    if (kaichiku) {
      cost -= 1;
    }

    return cost;
  }

  private makeWeaponDataFromInputText(text: string): FsWeapon {
    //const location = `${this.className}.makeWeaponDataFromInputText()`;
    let weapon: FsWeapon = new FsWeapon();
    let name: string = text;

    // Get weapon info from input text
    // if the input text has separater character "|".
    if (text.indexOf('|') >= 0) {
      // Split text.
      const tokens = text.split('|');
      if (tokens.length !== 3) {
        this.logger.error(location, 'Invalid format text.', { text: text });
        throw Error(`${location} Invalid format text. ${{ text: text }}`);
      }
      const rarerity = Number(tokens[0]);
      const typeName = tokens[1];
      name = tokens[2];

      // Make weapon info.
      weapon.name = name;
      weapon.rarerity = rarerity;
      for (let i = 0; i < this.weaponTypes.length; ++i) {
        if (typeName === this.weaponTypes[i].name) {
          weapon.type = this.weaponTypes[i].id;
          break;
        }
      }
    }

    // Existing weapon.
    else {
      // Check if the input weapon name is existing or not.
      for (let i = 0; i < this.weapons.length; ++i) {
        if (name === this.weapons[i].name) {
          weapon = this.weapons[i];
          break;
        }
      }
    }

    return weapon;
  }

  private makeFacilityDataFromInputText(text: string): FsFacility {
    const location = `${this.className}.makeFacilityDataFromInputText()`;
    let facility: FsFacility = new FsFacility();
    let name: string = text;

    // Get facility info from input text
    // if the input text has separater character "|".
    if (text.indexOf('|') >= 0) {
      // Split text.
      const tokens = text.split('|');
      if (tokens.length !== 3) {
        this.logger.error(location, 'Invalid format text.', { text: text });
        throw Error(`${location} Invalid format text. ${{ text: text }}`);
      }
      const rarerity = Number(tokens[0]);
      const typeName = tokens[1];
      name = tokens[2];

      // Make facility info.
      facility.name = name;
      facility.rarerity = rarerity;
      for (let i = 0; i < this.facilityTypes.length; ++i) {
        if (typeName === this.facilityTypes[i].name) {
          facility.type = this.facilityTypes[i].id;
          break;
        }
      }
    }

    // Existing facility.
    else {
      // Check if the input facility name is existing or not.
      for (let i = 0; i < this.facilities.length; ++i) {
        if (name === this.facilities[i].name) {
          facility = this.facilities[i];
          break;
        }
      }
    }

    return facility;
  }

  private makeCharacterTagDataFromInputText(text: string): FsCharacterTag {
    const location = `${this.className}.makeCharacterTagDataFromInputText()`;
    let tag: FsCharacterTag = new FsCharacterTag();
    let name: string = text;

    // Get tag info from input text
    // if the input text has separater character "|".
    if (text.indexOf('|') >= 0) {
      // Split text.
      const tokens = text.split('|');
      if (tokens.length !== 2) {
        this.logger.error(location, 'Invalid format text.', { text: text });
        throw Error(`${location} Invalid format text. ${{ text: text }}`);
      }
      name = tokens[0];

      // Make tag info.
      tag.name = name;
    }

    // Existing character tag.
    else {
      // Check if the input tag name is existing or not.
      for (let i = 0; i < this.characterTags.length; ++i) {
        if (name === this.characterTags[i].name) {
          tag = this.characterTags[i];
          break;
        }
      }
    }

    return tag;
  }

  private makeAbilityInfoForFormResult(
    input: FsAbilityForNewCharacterForm,
    type: FsAbilityType
  ): FsAbilityForNewCharacterForm {
    const result: FsAbilityForNewCharacterForm = new FsAbilityForNewCharacterForm();

    result.id = input.id;
    result.type = type.id;
    result.typeName = type.name;
    result.name = input.name;
    result.descriptions = input.descriptions.filter((text) => text.length > 0);
    result.interval = input.interval;
    result.cost = input.cost;
    for (let i = 0; i < input.tokenLayouts.length; ++i) {
      if (input.tokenLayouts[i].length > 0) {
        result.tokenLayouts.push(input.tokenLayouts[i]);
      }
    }

    return result;
  }

  private validateForm() {
    const location = `${this.className}.validateForm()`;

    // Clear status and error message.
    this.isFormValid = false;
    this.errorMessage = '';

    // Basic information.
    {
      // Character type.
      if (!this.selectedCharacterType) {
        this.logger.warn(location, 'No character type is selected.');
        this.errorMessage = 'キャラクタータイプを選択してください。';
        return;
      }

      // Sub-character type.
      if (this.selectedCharacterType.subTypes.length > 0 && !this.selectedSubCharacterType) {
        this.logger.warn(location, 'No character type is selected.');
        this.errorMessage = 'キャラクタータイプを選択してください。';
        return;
      }

      // Character name.
      if (this.inputCharacterName === '') {
        this.logger.warn(location, 'No character name is input.');
        this.errorMessage = 'キャラクター名を入力してください。';
        return;
      }
      for (let i = 0; i < this.characters.length; ++i) {
        if (this.characters[i].name === this.inputCharacterName) {
          this.logger.warn(location, 'Existing character name.');
          this.errorMessage = '登録済のキャラクター名です。';
          return;
        }
      }

      // Rarerity.
      if (!this.selectedRarerity) {
        this.logger.warn(location, 'No rarerity is selected.');
        this.errorMessage = 'レアリティを選択してください。';
        return;
      }

      // Weapon type.
      if (!this.selectedWeaponType) {
        this.logger.warn(location, 'No weapon type is selected.');
        this.errorMessage = '武器タイプを選択してください。';
        return;
      }

      // Geograph type.
      if (this.selectedGeographTypes.length === 0) {
        this.logger.warn(location, 'No geograph type is selected.');
        this.errorMessage = '地形適性を選択してください。';
        return;
      }

      // Regions.
      if (this.selectedCharacterType.regions && !this.selectedRegion) {
        this.logger.warn(location, 'No region type is selected.');
        this.errorMessage = '地域を選択してください。';
        return;
      }

      // Voice actor. --> Nothing to do.
      // Illustrator. --> Nothing to do.
      // Motif weapon. --> Nothing to do.
      // Motif facility. --> Nothing to do.
      // Character tag. --> Nothing to do.
    }

    // Abilities.
    {
      if (this.validateAbilityInputs(this.inputAbilities, this.selectedAbilityTypes) === false) {
        return;
      }
      if (this.validateAbilityInputs(this.inputAbilitiesKai, this.selectedAbilityTypesKai) === false) {
        return;
      }
    }

    // If the process come here, the form is valid.
    this.isFormValid = true;

    return;
  }

  private validateAbilityInputs(
    inputAbilities: FsAbilityForNewCharacterForm[],
    selectedAbilityTypes: FsAbilityType[]
  ): boolean {
    const location = `${this.className}.validateAbilityInputs()`;

    for (let i = 0; i < inputAbilities.length; ++i) {
      const ability = inputAbilities[i];
      const abilityType = selectedAbilityTypes[i];

      // Ability name.
      if (ability.name === '') {
        this.logger.warn(location, 'No ablity name is input.', { index: i, kaichiku: false });
        this.errorMessage = '特技/計略名を入力してください。';
        return false;
      }

      // Ability type.
      if (!abilityType) {
        this.logger.warn(location, 'No ablity type is selected.', { index: i, kaichiku: false });
        this.errorMessage = '特技/計略タイプを選択してください。';
        return false;
      }

      // Token layout.
      if (abilityType.name === '計略' && ability.tokenAvailable) {
        if (!ability.tokenLayouts || ability.tokenLayouts.length === 0) {
          this.logger.warn(location, 'No token layout option is selected.', { index: i, kaichiku: false });
          this.errorMessage = 'トークン計略の場合はトークンの配置マスタイプを選択してください。';
          return false;
        }
        let isBlank = true;
        for (let j = 0; j < ability.tokenLayouts.length; ++j) {
          if (ability.tokenLayouts[j] !== '') {
            isBlank = false;
            break;
          }
        }
        if (isBlank) {
          this.logger.warn(location, 'No token layout option is selected.', { index: i, kaichiku: false });
          this.errorMessage = 'トークン計略の場合はトークンの配置マスタイプを選択してください。';
          return false;
        }
      }

      // Description.
      if (!ability.descriptions || ability.descriptions.length === 0 || ability.descriptions[0] === '') {
        this.logger.warn(location, 'No ability description is input.', { index: i, kaichiku: false });
        this.errorMessage = '特技/計略の説明を入力してください。説明文は1行目から入力してください。';
        return false;
      }
    }

    return true;
  }

  private scrollToTop() {
    this.logger.trace('scrollToTop()');
    document.getElementById('MainContents')?.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
