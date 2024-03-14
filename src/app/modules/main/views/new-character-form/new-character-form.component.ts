import { Component, EventEmitter, Input, Output, ElementRef, OnInit, AfterViewInit } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { CsCharacterImageTypeMax, csCharacterImageTypes } from 'src/app/services/cloud-storage/cloud-storage.interface';
import { ErrorCode } from 'src/app/services/error-handler/error-code.enum';
import { ErrorHandlerService } from 'src/app/services/error-handler/error-handler.service';
import { FsCollectionName } from 'src/app/services/firestore-data/firestore-collection-name.enum';
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
  MapCellType,
} from 'src/app/services/firestore-data/firestore-document.interface';
import { HtmlCanvas } from '../../utils/html-canvas/html-canvas.utility';
import { loadImageFile } from '../../utils/image-file/image-file.utility';
import { sleep } from '../../utils/sleep/sleep.utility';
import { ThumbnailMakeInfo, XY } from '../make-thumbnail-form/make-thumbnail-form.interface';
import { NewFacilityFormData } from '../new-facility-form/new-facility-form.interafce';
import { NewWeaponFormData } from '../new-weapon-form/new-weapon-form.interface';
import { FsAbilityForNewCharacterForm, ImageDataWithProperty, NewCharacterFormData, NewCharacterFormMode } from './new-character-form.interface';

@Component({
  selector: 'app-new-character-form',
  templateUrl: './new-character-form.component.html',
  styleUrls: ['./new-character-form.component.scss'],
})
export class NewCharacterFormComponent implements OnInit, AfterViewInit {
  private readonly className = 'NewCharacterFormComponent';

  /** Appearance. */
  @Input() mode: NewCharacterFormMode = 'normal';

  @Input() styleClass = '';

  @Input() hideButton = false;

  iconButtonWidth = 50; // px

  previewCanvasWidth = 300; // px

  previewCanvasHeight = this.previewCanvasWidth;

  /** Button label and style. */
  @Input() okLabel = 'Ok';

  @Input() cancelLabel = 'Cancel';

  @Input() buttonStyleClass = '';

  /** Form data. */
  @Input() characterData!: NewCharacterFormData;

  @Output() characterDataChange = new EventEmitter<NewCharacterFormData>();

  @Output() canceled = new EventEmitter<boolean>();

  /** Character Type */
  characterTypes = this.firestore.getData(FsCollectionName.CharacterTypes) as FsCharacterType[];

  subCharacterTypes = this.firestore.getData(FsCollectionName.SubCharacterTypes) as FsSubCharacterType[];

  subCharacterTypeItems!: FsSubCharacterType[]; // Sub character types list filtered by the selected character type. Init at ngOnChanges().

  /** Character Name */
  characters = this.firestore.getData(FsCollectionName.Characters) as FsCharacter[];

  /** Rearity */
  rarerityItems: number[] = []; // Itit at the constructor.

  /** Weapon Type */
  weaponTypes = this.firestore.getData(FsCollectionName.WeaponTypes) as FsWeaponType[]; // All weapon types list from the database.

  weaponTypeItems!: FsWeaponType[]; // Weapon types list filtered by the selected character type. Init at ngOnChanges().

  /** Geograph type. */
  geographTypes = this.firestore.getData(FsCollectionName.GeographTypes) as FsGeographType[]; // All geograph types list from the database.

  geographTypeItems!: FsGeographType[]; // Geograph types list filtered by the selected character type. Init at ngOnChanges().

  /** Region. */
  regions = this.firestore.getData(FsCollectionName.Regions) as FsRegion[]; // All reagions list from the database.

  regionItems!: FsRegion[]; // Regions list filtered by the selected character type. Init at ngOnChanges().

  /** Cost */
  inputCharacterCost = 0;

  inputCharacterCostKai = 0;

  /** Voice actor. */
  voiceActors = this.firestore.getData(FsCollectionName.VoiceActors) as FsVoiceActor[];

  suggestVoiceActorNames: string[] = [];

  /** Illustrator. */
  illustrators = this.firestore.getData(FsCollectionName.Illustrators) as FsIllustrator[];

  suggestIllustratorNames: string[] = [];

  /** Motif weapons */
  weapons = this.firestore.getData(FsCollectionName.Weapons) as FsWeapon[];

  inputMotifWeapons: string[] = [];

  weaponForm = new NewWeaponFormData();

  showWeaponForm = false;

  /** Motif facilities. */
  facilities = this.firestore.getData(FsCollectionName.Facilities) as FsFacility[];

  inputMotifFacilities: string[] = [];

  facilityTypes = this.firestore.getData(FsCollectionName.FacilityTypes) as FsFacilityType[];

  facilityForm = new NewFacilityFormData();

  showFacilityForm = false;

  /** Tags. */
  characterTags = this.firestore.getData(FsCollectionName.CharacterTags) as FsCharacterTag[];

  inputCharacterTags: string[] = [];

  /** Ability Type */
  abilityTypes = this.firestore.getData(FsCollectionName.AbilityTypes) as FsAbilityType[];

  selectedAbilityTypes: FsAbilityType[] = [];

  selectedAbilityTypesKai: FsAbilityType[] = [];

  keiryakuTypeId!: string;

  /** Ability */
  abilities = this.firestore.getData(FsCollectionName.Abilities) as FsAbility[];

  suggestAbilityNames: string[][] = [];

  suggestAbilityNamesKai: string[][] = [];

  inputAbilities: FsAbilityForNewCharacterForm[] = [];

  inputAbilitiesKai: FsAbilityForNewCharacterForm[] = [];

  abilityFormMax = 8;

  readonly tokenCellTypes: MapCellType[] = ['赤', '青', '水上'];

  /** Validation */
  isFormValid = true;

  errorMessage: string = '';

  /** Shiromusume images. */
  imageTypesAndLabels = csCharacterImageTypes;

  imageTypeMax: number = CsCharacterImageTypeMax;

  inputImageFiles: Blob[] = Array(this.imageTypeMax);

  inputImageFilesKai: Blob[] = Array(this.imageTypeMax);

  imageLoadStatus: ('empty' | 'loading' | 'loaded')[] = Array(this.imageTypeMax);

  imageLoadStatusKai: ('empty' | 'loading' | 'loaded')[] = Array(this.imageTypeMax);

  /** Thumbnail image dialog. */
  showMakeThumbnailDialog = false;

  thumbInfo: ThumbnailMakeInfo = new ThumbnailMakeInfo();

  readonly defaultThumbScale = 80;

  thumbCanceled = true;

  /** Native element for control spin button focus. */
  private _el: HTMLElement;

  //============================================================================
  // Class methods.
  //
  constructor(private logger: NGXLogger, private firestore: FirestoreDataService, private elemRef: ElementRef, private errorHandler: ErrorHandlerService) {
    this.logger.trace(`new ${this.className}()`);

    // Initialize thumbnail settings.
    this.thumbInfo.imageSize = new XY(160, 160);
    this.thumbInfo.scale = this.defaultThumbScale;

    // Initialize rarerity list.
    for (let i = 0; i < FsCharacterRarerityMax; ++i) {
      this.rarerityItems.push(i + 1);
    }

    // Init native element.
    this._el = elemRef.nativeElement;
  }

  ngOnInit(): void {
    const location = `${this.className}.ngOnInit()`;
    this.logger.trace(location);

    // Character type.
    this.firestore.sortByCode(this.characterTypes);
    if (this.characterData.characterType.name === '') {
      this.characterData.characterType = this.characterTypes[0];
    }
    const characterType = this.characterData.characterType;

    // Sub character type.
    this.subCharacterTypeItems = this.subCharacterTypes.filter((item) => item.parent === characterType.id);
    this.firestore.sortByCode(this.subCharacterTypeItems);

    // Weapon type.
    this.weaponTypeItems = this.makeFilteredFormItems(characterType.weaponTypes, this.weaponTypes);
    this.firestore.sortByCode(this.weaponTypeItems);

    // Geograph type.
    this.geographTypeItems = this.makeFilteredFormItems(characterType.geographTypes, this.geographTypes);
    this.firestore.sortByOrder(this.geographTypeItems);

    // Region.
    if (characterType.regions) {
      this.regionItems = this.makeFilteredFormItems(characterType.regions, this.regions);
      this.firestore.sortByOrder(this.regionItems);
    }

    // Copy motif weapon.
    try {
      for (let i = 0; i < this.characterData.motifWeapons.length; ++i) {
        // const textChip = this.makeTextChipForMotifWeapon(this.characterData.motifWeapons[i]);
        this.inputMotifWeapons.push(this.characterData.motifWeapons[i].name);
      }
      for (let i = 0; i < this.characterData.motifFacilities.length; ++i) {
        // const textChip = this.makeTextChipForMotifFacility(this.characterData.motifFacilities[i]);
        this.inputMotifFacilities.push(this.characterData.motifFacilities[i].name);
      }
    } catch (err) {
      this.errorHandler.notifyError(err);
    }

    // Character tags.
    for (let i = 0; i < this.characterData.characterTags.length; ++i) {
      this.inputCharacterTags.push(this.characterData.characterTags[i].name);
    }

    // Ability type.
    this.firestore.sortByOrder(this.abilityTypes);

    // Get keiryaku ability type.
    for (let i = 0; i < this.abilityTypes.length; ++i) {
      if (this.abilityTypes[i].name == '計略') {
        this.keiryakuTypeId = this.abilityTypes[i].id;
        break;
      }
    }

    // Copy ability info.
    this.inputAbilities = [];
    this.selectedAbilityTypes = [];
    for (let i = 0; i < this.characterData.abilities.length; ++i) {
      const ability = this.characterData.abilities[i];
      this.inputAbilities.push(this.initInputAbilityInfo(ability));
      this.selectedAbilityTypes.push(this.initSelectedAbilityType(ability));
      this.onAutofillInputSelect(ability.name, `NewCharacterForm_AbilityNameInput_${i}`);
    }

    // Copy ability info (kaichiku).
    this.inputAbilitiesKai = [];
    this.selectedAbilityTypesKai = [];
    for (let i = 0; i < this.characterData.abilitiesKai.length; ++i) {
      const ability = this.characterData.abilitiesKai[i];
      this.inputAbilitiesKai.push(this.initInputAbilityInfo(ability));
      this.selectedAbilityTypesKai.push(this.initSelectedAbilityType(ability));
      this.onAutofillInputSelect(ability.name, `NewCharacterForm_AbilityNameKaiInput_${i}`);
    }
  }

  async ngAfterViewInit(): Promise<void> {
    // Set input focus to the character name input.
    this.focusCharacterNameInput();

    // Wait canvas elements become available.
    await this.waitUntilCanvasReady();

    // Copy character images.
    try {
      // Character images.
      for (let i = 0; i < this.characterData.imageFiles.length; ++i) {
        if (this.characterData.imageFiles[i].status !== 'empty') {
          this.inputImageFiles[i] = this.characterData.imageFiles[i].data;
          this.imageLoadStatus[i] = 'loading';
          await this.loadImageFileAndDrawImage(this.characterData.imageFiles[i].data, `NewCharacterForm_${this.imageTypesAndLabels[i].type}Preview`);
          this.imageLoadStatus[i] = 'loaded';

          // Set up thumb info.
          if (i === 0) {
            this.thumbInfo.image = this.characterData.imageFiles[i].data;
            this.thumbInfo.offset = new XY(0, 0);
            this.thumbInfo.scale = this.defaultThumbScale;
          }
        }
      }

      // Thumbnail image.
      if (this.characterData.thumbnailImage.status !== 'empty') {
        this.thumbInfo.thumb = this.characterData.thumbnailImage.data;
        await this.loadImageFileAndDrawImage(this.thumbInfo.thumb, 'NewCharacterForm_ThumbnailPreview');
        this.thumbCanceled = false;
      }
    } catch (error) {
      this.errorHandler.notifyError(error);
    }
  }

  focusCharacterNameInput() {
    document.getElementById('NewCharacterForm_CharacterNameInput')?.focus();
  }

  onCharacterTypeChanged() {
    this.logger.trace(`${this.className}.onCharacterTypeChanged()`);

    // Clear form except character type.
    this.clearForm(['characterType']);

    // Update sub character type list.
    this.subCharacterTypeItems = this.subCharacterTypes.filter((item) => item.parent === this.characterData.characterType.id);
    this.firestore.sortByCode(this.subCharacterTypeItems);
    if (this.subCharacterTypeItems.length > 0) {
      this.characterData.subCharacterType = this.subCharacterTypeItems[0];
    }

    // Update weapon type item list.
    this.weaponTypeItems = this.makeFilteredFormItems(this.characterData.characterType.weaponTypes, this.weaponTypes);
    this.firestore.sortByCode(this.weaponTypeItems);
    if (this.weaponTypeItems.length === 1) {
      this.characterData.weaponType = this.weaponTypeItems[0];
    }

    // Update geograph type item list.
    this.geographTypeItems = this.makeFilteredFormItems(this.characterData.characterType.geographTypes, this.geographTypes);
    this.firestore.sortByOrder(this.geographTypeItems);
    if (this.geographTypeItems.length === 1) {
      this.characterData.geographTypes = [this.geographTypeItems[0]];
    }

    // Update region item list.
    if (this.characterData.characterType.regions) {
      this.regionItems = this.makeFilteredFormItems(this.characterData.characterType.regions, this.regions);
      this.firestore.sortByOrder(this.regionItems);
      if (this.regionItems.length === 1) {
        this.characterData.region = this.regionItems[0];
      }
    }

    this.disableSpinButtonFocusByTabKey();
  }

  onChipInputAdd(event: any) {
    const location = `${this.className}.onChipInputAdd()`;
    this.logger.trace(location);

    const inputId = event.originalEvent.target.id;
    let value = event.value;

    // Switch process by target input element.
    try {
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
    } catch (e) {
      this.errorHandler.notifyError(e);
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
      this.disableSpinButtonFocusByTabKey();

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
      this.disableSpinButtonFocusByTabKey();

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

          // Turn off 'isExisting' in the 'dataEdit' mode.
          if (this.mode === 'dataEdit') {
            this.inputAbilities[index].isExisting = false;
          }
          break;
        }
      }
    }

    // CASE: Ability name (Kai)
    else if (inputId.indexOf('NewCharacterForm_AbilityNameKaiInput_') >= 0) {
      const index = Number(inputId.substring(inputId.lastIndexOf('_') + 1));
      let found = false;

      // Search ability from input ability list.
      for (let i = 0; i < this.inputAbilities.length; ++i) {
        if (this.inputAbilities[i].name === value) {
          this.inputAbilitiesKai[index] = this.makeFsAbilityForNewCharacterForm(this.inputAbilities[i]);
          this.selectedAbilityTypesKai[index] = this.selectedAbilityTypes[i];
          found = true;
        }
      }

      // Search ability info and copy it to input ability info.
      if (!found) {
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

            // Turn off 'isExisting' in the 'dataEdit' mode.
            if (this.mode === 'dataEdit') {
              this.inputAbilitiesKai[index].isExisting = false;
            }
            break;
          }
        }
      }
    }
  }

  async onAddAbilityButtonClick(kai: boolean) {
    const location = `${this.className}.onAddAbilityButtonClick()`;
    this.logger.trace(location, { kai: kai });

    // CASE: Before kaichiku.
    if (!kai) {
      this.selectedAbilityTypes.push(this.abilityTypes[0]);
      this.suggestAbilityNames.push([]);
      this.inputAbilities.push(this.makeFsAbilityForNewCharacterForm());
      await sleep(100);
      document.getElementById(`NewCharacterForm_AbilityNameInput_${this.inputAbilities.length - 1}`)?.focus();
    }

    // CASE: After kaichiku.
    else {
      this.selectedAbilityTypesKai.push(this.abilityTypes[0]);
      this.suggestAbilityNamesKai.push([]);
      this.inputAbilitiesKai.push(this.makeFsAbilityForNewCharacterForm());
      await sleep(100);
      document.getElementById(`NewCharacterForm_AbilityNameKaiInput_${this.inputAbilitiesKai.length - 1}`)?.focus();
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

  onAbilityTypeInputChange() {
    this.disableSpinButtonFocusByTabKey();
  }

  onNewWeaponDialogResult(canceled: boolean) {
    const location = `${this.className}.onNewWeaponDialogResult()`;
    this.logger.trace(location, { canceled: canceled });

    // Import form result to motif weapon field.
    if (!canceled) {
      const rarerityText = this.weaponForm.rarerity < 0 ? '-' : this.weaponForm.rarerity.toString();
      const weaponText = `${rarerityText}|${this.weaponForm.type.name}|${this.weaponForm.name}`;
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

  onNewFacilityFormResult(canceled: boolean) {
    const location = `${this.className}.onNewFacilityFormResult()`;
    this.logger.trace(location, { formResult: canceled });

    // Import form result to motif weapon field.
    if (!canceled) {
      const facilityText = `${this.facilityForm.rarerity}|${this.facilityForm.type.name}|${this.facilityForm.name}`;
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

  async onInputImageFileChange(index: number, kaichiku: boolean, event: Event) {
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
      this.imageLoadStatus[index] = 'loading';
      this.inputImageFiles[index] = input.files[0];
    } else {
      this.imageLoadStatusKai[index] = 'loading';
      this.inputImageFilesKai[index] = input.files[0];
    }

    try {
      await this.loadImageFileAndDrawImage(input.files[0], elemId);

      if (!kaichiku) {
        this.imageLoadStatus[index] = 'loaded';
        this.characterData.imageFiles[index].setImageData(input.files[0]);
      } else {
        this.imageLoadStatusKai[index] = 'loaded';
        this.characterData.imageFilesKai[index].setImageData(input.files[0]);
      }

      if (index === 0 && !kaichiku) {
        this.thumbInfo.image = input.files[0];
        this.thumbInfo.offset = new XY(0, 0);
        this.thumbInfo.scale = this.defaultThumbScale;
      }

      // Clear element value in order to trigger events even if user select the same file.
      input.value = '';
    } catch (error) {
      this.errorHandler.notifyError(error);
      return;
    }
  }

  onRemoveImageFileClick(index: number, kaichiku: boolean) {
    const location = `${this.className}.onRemoveImageFileClick()`;
    this.logger.trace(location, { index: index, kaichiku: kaichiku });

    if (!kaichiku) {
      this.inputImageFiles[index] = new Blob();
      this.imageLoadStatus[index] = 'empty';
      this.characterData.imageFiles[index].status = 'empty';
    } else {
      this.inputImageFilesKai[index] = new Blob();
      this.imageLoadStatusKai[index] = 'empty';
      this.characterData.imageFilesKai[index].status = 'empty';
    }
  }

  onMakeThumbnailFormClick() {
    const location = `${this.className}.onMakeThumbnailFormClick()`;
    this.logger.trace(location);

    this.showMakeThumbnailDialog = true;
  }

  async onMakeThumbnailFormResult(canceled: boolean) {
    const location = `${this.className}.onMakeThumbnailFormResult()`;
    this.logger.trace(location, { canceld: canceled });
    this.logger.debug(location, {
      ofsX: this.thumbInfo.offset.x,
      ofsY: this.thumbInfo.offset.y,
      scale: this.thumbInfo.scale,
    });
    this.thumbCanceled = canceled;

    if (!canceled) {
      try {
        await this.loadImageFileAndDrawImage(this.thumbInfo.thumb, 'NewCharacterForm_ThumbnailPreview');
        this.characterData.thumbnailImage.setImageData(this.thumbInfo.thumb);
      } catch (error) {
        this.errorHandler.notifyError(error);
      }
    }

    this.showMakeThumbnailDialog = false;
  }

  onOkClick() {
    this.validateForm();
    if (this.isFormValid) {
      this.makeCharacterInfo();
      this.characterDataChange.emit(this.characterData);
      this.canceled.emit(false);
    } else {
      this.scrollToTop();
    }
  }

  onCancelClick() {
    this.clearForm();
    this.characterDataChange.emit(this.characterData);
    this.canceled.emit(true);
  }

  clearForm(exceptItems: string[] = []) {
    const location = `${this.className}.clearForm()`;
    this.logger.trace(location);

    if (exceptItems.includes('characterType') === false) {
      this.characterData.characterType = this.characterTypes[0];
    }
    if (exceptItems.includes('subCharacterType') === false) {
      this.characterData.subCharacterType = new FsSubCharacterType();
    }
    if (exceptItems.includes('characterName') === false) {
      this.characterData.characterName = '';
    }
    if (exceptItems.includes('rarerity') === false) {
      this.characterData.rarerity = 0;
    }
    if (exceptItems.includes('weaponType') === false) {
      this.characterData.weaponType = new FsWeaponType();
    }
    if (exceptItems.includes('geographType') === false) {
      this.characterData.geographTypes = [];
    }
    if (exceptItems.includes('region') === false) {
      this.characterData.region = new FsRegion();
    }
    if (exceptItems.includes('cost') === false) {
      this.characterData.cost = 0;
      this.characterData.costKai = 0;
      this.inputCharacterCost = 0;
      this.inputCharacterCostKai = 0;
    }
    if (exceptItems.includes('voiceActor') === false) {
      this.characterData.voiceActor.name = '';
    }
    if (exceptItems.includes('illustrator') === false) {
      this.characterData.illustrator.name = '';
    }
    if (exceptItems.includes('motifWeapon') === false) {
      this.inputMotifWeapons = [];
      this.characterData.motifWeapons = [];
    }
    if (exceptItems.includes('motifFacility') === false) {
      this.inputMotifFacilities = [];
      this.characterData.motifFacilities = [];
    }
    if (exceptItems.includes('characterTag') === false) {
      this.inputCharacterTags = [];
      this.characterData.characterTags = [];
    }
    if (exceptItems.includes('implementedDate') === false) {
      this.characterData.implementedDate = undefined;
    }
    if (exceptItems.includes('ability') === false) {
      this.selectedAbilityTypes = [];
      this.selectedAbilityTypesKai = [];
      this.inputAbilities = [];
      this.inputAbilitiesKai = [];
      this.characterData.abilities = [];
      this.characterData.abilitiesKai = [];
    }

    if (exceptItems.includes('images') === false) {
      for (let i = 0; i < this.imageTypeMax; ++i) {
        this.imageLoadStatus[i] = 'empty';
        this.inputImageFiles[i] = new Blob();
        this.imageLoadStatusKai[i] = 'empty';
        this.inputImageFilesKai[i] = new Blob();
      }
      this.thumbInfo.thumb = new Blob();
      this.thumbCanceled = true;
      this.characterData.imageFiles = [];
      this.characterData.imageFilesKai = [];
      for (let i = 0; i < csCharacterImageTypes.length; ++i) {
        this.characterData.imageFiles.push(new ImageDataWithProperty());
        this.characterData.imageFilesKai.push(new ImageDataWithProperty());
      }
      this.characterData.thumbnailImage = new ImageDataWithProperty();
    }
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
  //----------------------------------------------------------------------------
  // Initialization.
  //
  private initInputAbilityInfo(src: FsAbilityForNewCharacterForm): FsAbilityForNewCharacterForm {
    const result = { ...src };

    result.descriptions = ['', '', ''];
    for (let j = 0; j < src.descriptions.length; ++j) {
      result.descriptions[j] = src.descriptions[j].slice();
    }
    result.tokenLayouts = [];
    for (let j = 0; j < src.tokenLayouts.length; ++j) {
      result.tokenLayouts.push(src.tokenLayouts[j]);
    }

    return result;
  }

  private initSelectedAbilityType(src: FsAbilityForNewCharacterForm): FsAbilityType {
    const location = `${this.className}.initSelectedAbilityType()`;

    const result = this.abilityTypes.find((item) => item.id === src.type);
    if (!result) {
      this.logger.error(location, 'Unknown ability type.', { type: src.type });
      const error = new Error(`${location} Unknown ability type. ${src.type}`);
      error.name = ErrorCode.Unexpected;
      throw error;
    }

    return result;
  }

  private makeTextChipForMotifWeapon(src: FsWeapon): string {
    let result = '';
    let rarerity = '';

    if (src.rarerity < 0) {
      rarerity = '-';
    } else {
      rarerity = src.rarerity.toString();
    }

    const type = this.firestore.getDataById(FsCollectionName.WeaponTypes, src.type) as FsWeaponType;

    result = `${rarerity}|${type.name}|${src.name}`;

    return result;
  }

  private makeTextChipForMotifFacility(src: FsFacility): string {
    let result = '';
    let rarerity = '';

    if (src.rarerity < 0) {
      rarerity = '-';
    } else {
      rarerity = src.rarerity.toString();
    }

    const type = this.firestore.getDataById(FsCollectionName.FacilityTypes, src.type) as FsFacilityType;

    result = `${rarerity}|${type.name}|${src.name}`;

    return result;
  }

  //----------------------------------------------------------------------------
  // Input event handlers.
  //
  private onMotifWeaponInputAdd(inputId: string, value: string) {
    const location = `${this.className}.onMotifWeaponInputAdd()`;

    // Get index.
    const index = this.inputMotifWeapons.findIndex((item) => item === value);
    if (index < 0) {
      this.logger.error(location, 'Input text is not binded.', { value: value });
      const error = new Error(`${location} Input text is not binded. It seems a program error.`);
      error.name = ErrorCode.Unexpected;
      throw error;
    }

    // Remove forbidden character if it includes one.
    if (value.includes('|')) {
      this.logger.warn(location, 'Forbidden character is found.', { value: value });
      value = value.replace(/\|/g, '');
      this.inputMotifWeapons[index] = value;
    }

    // Open new weapon form if input motif weapon name is new.
    if (this.weapons.findIndex((item) => item.name === value) < 0) {
      this.inputMotifWeapons.splice(index); // Remove text chip.
      this.weaponForm = new NewWeaponFormData();
      this.weaponForm.name = value; // Set initial value.
      this.weaponForm.type = this.characterData.weaponType;
      this.showWeaponForm = true;
    }
  }

  private onMotifFacilityInputAdd(inputId: string, value: string) {
    const location = `${this.className}.onMotifFacilityInputAdd()`;

    // Get index.
    const index = this.inputMotifFacilities.findIndex((item) => item === value);
    if (index < 0) {
      this.logger.error(location, 'Input text is not binded.');
      const error = new Error(`${location} Input text is not binded. It seems a program error.`);
      error.name = ErrorCode.Unexpected;
      throw error;
    }

    // Remove forbidden character if it includes one.
    if (value.includes('|')) {
      this.logger.warn(location, 'Forbidden character is found.', { value: value });
      value = value.replace(/\|/g, '');
      this.inputMotifFacilities[index] = value;
    }

    // Open new weapon form if input motif weapon name is new.
    if (this.facilities.findIndex((item) => item.name === value) < 0) {
      this.inputMotifFacilities.splice(index); // Remove text chip.
      this.facilityForm = new NewFacilityFormData();
      this.facilityForm.name = value;
      this.showFacilityForm = true;
    }
  }

  private onCharacterTagInputAdd(inputId: string, value: string) {
    const location = `${this.className}.onCharacterTagInputAdd()`;

    // Get index.
    const index = this.inputCharacterTags.findIndex((item) => item === value);
    if (index < 0) {
      this.logger.error(location, 'Input text is not binded.');
      const error = new Error(`${location} Input text is not binded. It seems a program error.`);
      error.name = ErrorCode.Unexpected;
      throw error;
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

  //----------------------------------------------------------------------------
  // Form item control.
  //
  private makeFilteredFormItems<T extends FsDocumentBase>(filter: string[], fsData: T[]): T[] {
    const location = `${this.className}.makeFilteredFormItems()`;
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

  private makeFsAbilityForNewCharacterForm(base?: FsAbility): FsAbilityForNewCharacterForm {
    const result = new FsAbilityForNewCharacterForm();

    if (base) {
      // Base FsAbility info.
      result.id = base.id.slice();
      result.type = base.type.slice();
      result.name = base.name.slice();
      result.descriptions = [];
      for (let i = 0; i < base.descriptions.length; ++i) {
        result.descriptions.push(base.descriptions[i].slice());
      }
      if (base.initialInterval) {
        result.initialInterval = base.initialInterval;
      }
      result.interval = base.interval;
      result.cost = base.cost;
      result.tokenLayouts = [];
      for (let i = 0; i < base.tokenLayouts.length; ++i) {
        result.tokenLayouts.push(base.tokenLayouts[i]);
      }

      // Extended info.
      for (let i = 0; i < this.abilityTypes.length; ++i) {
        if (base.type === this.abilityTypes[i].id) {
          result.typeDetail = this.abilityTypes[i];
          break;
        }
      }
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

  //----------------------------------------------------------------------------
  // Image file control.
  //
  private async loadImageFileAndDrawImage(file: Blob, elemId: string) {
    const result = await loadImageFile(file);
    const canvas = new HtmlCanvas(elemId);
    canvas.width = result.height;
    canvas.height = result.height;
    const offsetX = (result.height - result.width) / 2;
    canvas.drawImage(result, offsetX, 0);
  }

  //----------------------------------------------------------------------------
  // Make result character info.
  //
  private makeCharacterInfo() {
    // Type, name, rarerity, weapon type, geograph type, region, and implemented date.

    // Voice actor.
    for (let i = 0; i < this.voiceActors.length; ++i) {
      if (this.characterData.voiceActor.name === this.voiceActors[i].name) {
        this.characterData.voiceActor = this.voiceActors[i];
        break;
      }
    }

    // Illustrator.
    for (let i = 0; i < this.illustrators.length; ++i) {
      if (this.characterData.illustrator.name === this.illustrators[i].name) {
        this.characterData.illustrator = this.illustrators[i];
        break;
      }
    }

    // Motif weapon.
    this.characterData.motifWeapons = [];
    for (let i = 0; i < this.inputMotifWeapons.length; ++i) {
      this.characterData.motifWeapons.push(this.makeWeaponDataFromInputText(this.inputMotifWeapons[i]));
    }

    // Motif facility.
    this.characterData.motifFacilities = [];
    for (let i = 0; i < this.inputMotifFacilities.length; ++i) {
      this.characterData.motifFacilities.push(this.makeFacilityDataFromInputText(this.inputMotifFacilities[i]));
    }

    // Character tag.
    this.characterData.characterTags = [];
    for (let i = 0; i < this.inputCharacterTags.length; ++i) {
      this.characterData.characterTags.push(this.makeCharacterTagDataFromInputText(this.inputCharacterTags[i]));
    }

    // Ability type and ability.
    {
      // Copy ability info.
      this.characterData.abilities = [];
      for (let i = 0; i < this.inputAbilities.length; ++i) {
        this.characterData.abilities.push(this.makeAbilityInfoForFormResult(this.inputAbilities[i], this.selectedAbilityTypes[i]));
      }
      this.characterData.abilitiesKai = [];
      for (let i = 0; i < this.inputAbilitiesKai.length; ++i) {
        this.characterData.abilitiesKai.push(this.makeAbilityInfoForFormResult(this.inputAbilitiesKai[i], this.selectedAbilityTypesKai[i]));
      }
    }

    // Character cost.
    this.characterData.cost = this.calcCharacterCost(
      this.characterData.characterType,
      this.characterData.weaponType,
      this.characterData.abilities,
      this.characterData.abilitiesKai,
      false
    );
    this.characterData.costKai = this.calcCharacterCost(
      this.characterData.characterType,
      this.characterData.weaponType,
      this.characterData.abilities,
      this.characterData.abilitiesKai,
      true
    );

    // Image files.
    // Image files are already stored.
    // Do nothing.
  }

  private calcCharacterCost(
    characterType: FsCharacterType,
    weaponType: FsWeaponType,
    abilities: FsAbility[],
    abilitiesKai: FsAbility[],
    kaichiku: boolean
  ): number {
    const location = `${this.className}.calcCharacterCost()`;

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
    this.logger.debug(location, { baseCost: weaponType.baseCost });

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

    this.logger.debug(location, { kaichiku: kaichiku, hasKeiryaku: hasKeiryaku, hasKeiryakuKai: hasKeiryakuKai });

    // Calculate character cost.
    if (hasKeiryaku) {
      cost += 2;
    } else if (kaichiku && hasKeiryakuKai) {
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
      const rarerity = tokens[0] === '-' ? -1 : Number(tokens[0]);
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

  private makeAbilityInfoForFormResult(input: FsAbilityForNewCharacterForm, type: FsAbilityType): FsAbilityForNewCharacterForm {
    const result: FsAbilityForNewCharacterForm = new FsAbilityForNewCharacterForm();

    result.id = input.id;
    result.type = type.id;
    result.typeDetail = type;
    result.name = input.name;
    result.descriptions = input.descriptions.filter((text) => text.length > 0);
    result.initialInterval = input.initialInterval;
    result.interval = input.interval;
    result.cost = input.cost;
    for (let i = 0; i < input.tokenLayouts.length; ++i) {
      if (input.tokenLayouts[i].length > 0) {
        result.tokenLayouts.push(input.tokenLayouts[i]);
      }
    }

    return result;
  }

  //----------------------------------------------------------------------------
  // Form validation.
  //
  private validateForm() {
    const location = `${this.className}.validateForm()`;

    // Clear status and error message.
    this.isFormValid = false;
    this.errorMessage = '';

    // Nothing to do when it runs in image mode
    if (this.mode === 'imageEdit') {
      this.isFormValid = true;
      return;
    }

    // Basic information.
    {
      // Character type.
      if (this.characterData.characterType.name === '') {
        this.logger.warn(location, 'No character type is selected.');
        this.errorMessage = 'キャラクタータイプを選択してください。';
        return;
      }

      // Sub-character type.
      if (this.characterData.characterType.hasSubTypes && this.characterData.subCharacterType.name === '') {
        this.logger.warn(location, 'No character type is selected.');
        this.errorMessage = 'キャラクタータイプを選択してください。';
        return;
      }

      // Character name.
      if (this.characterData.characterName === '') {
        this.logger.warn(location, 'No character name is input.');
        this.errorMessage = 'キャラクター名を入力してください。';
        return;
      }
      if (this.mode === 'normal') {
        for (let i = 0; i < this.characters.length; ++i) {
          if (this.characters[i].name === this.characterData.characterName) {
            this.logger.warn(location, 'Existing character name.');
            this.errorMessage = '登録済のキャラクター名です。';
            return;
          }
        }
      }

      // Rarerity.
      if (this.characterData.rarerity === 0) {
        this.logger.warn(location, 'No rarerity is selected.');
        this.errorMessage = 'レアリティを選択してください。';
        return;
      }

      // Weapon type.
      if (this.characterData.weaponType.name === '') {
        this.logger.warn(location, 'No weapon type is selected.');
        this.errorMessage = '武器タイプを選択してください。';
        return;
      }

      // Geograph type.
      if (this.characterData.geographTypes.length === 0) {
        this.logger.warn(location, 'No geograph type is selected.');
        this.errorMessage = '地形適性を選択してください。';
        return;
      }

      // Regions.
      if (this.characterData.characterType.regions.length > 0 && this.characterData.region.name === '') {
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

  private validateAbilityInputs(inputAbilities: FsAbilityForNewCharacterForm[], selectedAbilityTypes: FsAbilityType[]): boolean {
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
      if (abilityType.hasToken) {
        if (!ability.tokenLayouts || ability.tokenLayouts.length === 0) {
          this.logger.warn(location, 'No token layout option is selected.', { index: i, kaichiku: false });
          this.errorMessage = '伏兵計略の場合は伏兵の配置マスタイプを選択してください。';
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

  //----------------------------------------------------------------------------
  // Other utilities.
  //
  private scrollToTop() {
    this.logger.trace('scrollToTop()');
    document.getElementById('MainContents')?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private async disableSpinButtonFocusByTabKey() {
    const location = `${this.className}.disableSpinButtonFocusByTabKey()`;

    await sleep(20);

    const buttons = this._el.querySelectorAll('.p-inputnumber-button');
    this.logger.debug(location, { buttons: buttons.length });
    for (let i = 0; i < buttons.length; ++i) {
      buttons[i].setAttribute('tabindex', '-1');
    }
  }

  private async waitUntilCanvasReady() {
    const location = `${this.className}.waitUntilCanvasReady()`;
    this.logger.trace(location);

    for (let i = 0; i < 10; ++i) {
      try {
        new HtmlCanvas('NewCharacterForm_ThumbnailPreview');
        new HtmlCanvas(`NewCharacterForm_${this.imageTypesAndLabels[0].type}Preview`);
        this.logger.info(location, `It takes ${i * 100} ms.`);
        break;
      } catch (error) {
        await sleep(100);
      }
    }
  }
}
