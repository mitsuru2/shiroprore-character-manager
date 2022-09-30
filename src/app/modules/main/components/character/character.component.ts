import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { ConfirmationService } from 'primeng/api';
import { AppInfo } from 'src/app/app-info.enum';
import { CsCharacterImageTypeMax, csCharacterImageTypes } from 'src/app/services/cloud-storage/cloud-storage.interface';
import { CloudStorageService } from 'src/app/services/cloud-storage/cloud-storage.service';
import { ErrorCode } from 'src/app/services/error-handler/error-code.enum';
import { ErrorHandlerService } from 'src/app/services/error-handler/error-handler.service';
import { FsCollectionName } from 'src/app/services/firestore-data/firestore-collection-name.enum';
import { FirestoreDataService } from 'src/app/services/firestore-data/firestore-data.service';
import {
  FsAbility,
  FsAbilityType,
  FsCharacter,
  FsCharacterTag,
  FsCharacterType,
  FsDocumentBase,
  FsFacility,
  FsFacilityType,
  FsGeographType,
  FsIllustrator,
  FsRegion,
  FsSubCharacterType,
  FsVoiceActor,
  FsWeapon,
  FsWeaponType,
} from 'src/app/services/firestore-data/firestore-document.interface';
import { SpinnerService } from '../../services/spinner/spinner.service';
import { UserAuthService } from '../../services/user-auth/user-auth.service';
import { HtmlElementUtil } from '../../utils/html-element-util/html-element-util.class';
import { sleep } from '../../utils/sleep/sleep.utility';
import { NewCharacterFormComponent } from '../../views/new-character-form/new-character-form.component';
import {
  FsAbilityForNewCharacterForm,
  ImageDataWithProperty,
  NewCharacterFormData,
} from '../../views/new-character-form/new-character-form.interface';

class CharacterImage {
  url = '';

  data: Blob = new Blob();

  valid = false;

  setImageData(data: Blob) {
    this.data = data;
    this.url = window.URL.createObjectURL(data);
    this.valid = true;
  }
}

export enum TableCellType {
  h1,
  h2,
  data,
}

@Component({
  selector: 'app-character',
  templateUrl: './character.component.html',
  styleUrls: ['./character.component.scss'],
})
export class CharacterComponent implements OnInit, AfterViewInit {
  private readonly className = 'CharacterComponent';

  /** New character form. */
  @ViewChild(NewCharacterFormComponent) private newCharacterForm!: NewCharacterFormComponent;

  /** Dialog initialization status. */
  isInit = false;

  /** Warning message. */
  private readonly changeOwnershipWarning = 'キャラクター所持状況の管理にはログインが必要です。';

  private readonly editCharacterInfoWarning = 'キャラクター情報の編集にはログインが必要です。';

  /** Firestore data. */
  private abilities = this.firestore.getData(FsCollectionName.Abilities) as FsAbility[];

  private abilityTypes = this.firestore.getData(FsCollectionName.AbilityTypes) as FsAbilityType[];

  /** Character information. */
  id = ''; // Character ID from URL paramter.

  character = new FsCharacter();

  /** Radio button: image type. */
  imageTypes = csCharacterImageTypes;

  selectedImageType = this.imageTypes[0];

  images: CharacterImage[] = [];

  thumbnail: Blob = new Blob();

  /** Switch: own the character */
  hasThisCharacter: boolean = false;

  /** Data edit dialog. */
  dataEditFormShown = false;

  characterFormData = new NewCharacterFormData();

  /** Image edit dialog. */
  imageEditFormShown = false;

  //============================================================================
  // Class methods.
  //
  constructor(
    private logger: NGXLogger,
    private firestore: FirestoreDataService,
    private storage: CloudStorageService,
    private route: ActivatedRoute,
    private userAuth: UserAuthService,
    private errorHandler: ErrorHandlerService,
    private confirmationDialog: ConfirmationService,
    private spinner: SpinnerService
  ) {
    this.logger.trace(`new ${this.className}()`);

    // Initialize image array (dummy).
    this.images = [];
    for (let i = 0; i < CsCharacterImageTypeMax; ++i) {
      this.images.push(new CharacterImage());
    }
  }

  ngOnInit(): void {
    const location = `${this.className}.ngOnInit()`;

    // Get character ID from URL.
    const tmpId = this.route.snapshot.paramMap.get('id');
    if (tmpId) {
      this.id = tmpId;
    } else {
      this.logger.error(location, 'No character ID.');
      const error = new Error(`${location} No character ID.`);
      error.name = ErrorCode.Unexpected;
      this.errorHandler.notifyError(error);
    }

    // Sort ability type.
    this.firestore.sortByOrder(this.abilityTypes);

    // Get user info.
    this.userAuth.addEventListener('signIn', this.onUserSignedIn.bind(this));
    this.userAuth.addEventListener('signOut', this.onUserSignedOut.bind(this));
  }

  /**
   * 1. Get character information.
   * 2. Make character information table.
   * 3. Draw character image.
   */
  async ngAfterViewInit(): Promise<void> {
    const location = `${this.className}.ngAfterViewInit()`;
    this.logger.trace(location, { hasThisCharacter: this.hasThisCharacter });

    try {
      // Load data if data loading is not finished.
      // Basically, this process is not needed. It's needed when user type URL directly.
      if (!this.firestore.loaded) {
        await this.firestore.loadAll();
      }

      // Get character information by character ID.
      this.character = this.firestore.getDataById(FsCollectionName.Characters, this.id) as FsCharacter;
      this.logger.info(location, { character: this.character });

      // Make character information table.
      this.makeCharacterInfoTable();

      // Start loading of character images.
      for (let i = 0; i < csCharacterImageTypes.length; ++i) {
        const path = this.storage.makeCharacterImagePath(this.character.index, csCharacterImageTypes[i].type);
        try {
          const data = await this.storage.get(path);
          this.images[i].setImageData(data);

          // Draw 1st image.
          if (i === 0) {
            this.updateImage();
          }
        } catch (error) {
          this.images[i].valid = false;
        }
      }

      // Load thumbnail image.
      this.thumbnail = await this.storage.get(this.storage.makeCharacterThumbnailPath(this.character.index));

      // Set initialized flag.
      this.isInit = true;
    } catch (error) {
      this.logger.error(location, error);
    }
  }

  onImageTypeClick() {
    const location = `${this.className}.onImageTypeClick()`;
    this.logger.trace(location, { type: this.selectedImageType.type });

    this.updateImage();
  }

  async onHasSwitchChange(event: any) {
    const location = `${this.className}.onCharacterHasSwitchChange()`;
    this.logger.trace(location, { value: event.checked });

    // CASE: Switch is checked.
    if (event.checked) {
      // If switch is checked by login user, update user information.
      if (this.userAuth.signedIn) {
        this.addToUserCharacterList(this.character.id);
      }

      // If switch is checked by annonymous user, it shows the confirmation dialog
      // and reset the switch status.
      else {
        this.showConfirmationDialog(this.changeOwnershipWarning);
      }
    }

    // CASE: Switch is unchecked.
    else {
      if (this.userAuth.signedIn) {
        this.removeFromUserCharacterList(this.character.id);
      }
    }
  }

  onDataEditButtonClick() {
    const location = `${this.className}.onDataEditButtonClick()`;
    this.logger.trace(location);

    // Check user login.
    if (this.userAuth.signedIn) {
      // Open edit dialog.
      this.characterFormData = this.convCharacterDataToFormData(this.character);

      this.dataEditFormShown = true;
    } else {
      // Show confirmation dialog if user is not signed in.
      this.showConfirmationDialog(this.editCharacterInfoWarning);
    }
  }

  async onDataEditFormResult(canceled: boolean) {
    const location = `${this.className}.onDataEditFormResult()`;
    this.logger.trace(location, { canceled: canceled, formData: this.characterFormData });

    if (!canceled) {
      // Update firebase data.
      this.spinner.show();
      await this.updateCharacterData();
      await this.firestore.loadAll();
      this.character = this.firestore.getDataById(FsCollectionName.Characters, this.id) as FsCharacter;
      this.makeCharacterInfoTable();
      this.spinner.hide();
    }

    this.dataEditFormShown = false;
  }

  onDataEditOkButtonClick() {
    this.newCharacterForm.onOkClick();
  }

  onDataEditCancelButtonClick() {
    this.newCharacterForm.onCancelClick();
  }

  onImageEditButtonClick() {
    const location = `${this.className}.onImageEditButtonClick()`;
    this.logger.trace(location);

    // Check user login.
    if (this.userAuth.signedIn) {
      this.characterFormData = this.convCharacterImageToFormData();
      this.imageEditFormShown = true;
    } else {
      // Show confirmation dialog if user is not signed in.
      this.showConfirmationDialog(this.editCharacterInfoWarning);
    }
  }

  async onImageEditFormResult(canceled: boolean) {
    const location = `${this.className}.onImageEditFormResult()`;
    this.logger.trace(location, { canceled: canceled });

    if (!canceled) {
      this.spinner.show();
      await this.uploadImages();
      this.updateImage();
      this.spinner.hide();
    }

    this.imageEditFormShown = false;
  }

  onImageEditOkButtonClick() {
    this.newCharacterForm.onOkClick();
  }

  onImageEditCancelButtonClick() {
    this.newCharacterForm.onCancelClick();
  }

  //============================================================================
  // Private methods.
  //
  //----------------------------------------------------------------------------
  // Character image.
  //
  private updateImage() {
    const location = `${this.className}.updateImage()`;

    const iType = csCharacterImageTypes.findIndex((item) => item.type === this.selectedImageType.type);
    const imageElement = document.getElementById('Character_ImagePreview') as HTMLImageElement;
    const anchorElement = document.getElementById('Character_ImageAnchor') as HTMLAnchorElement;

    this.logger.debug(location, this.images[iType]);
    imageElement.src = this.images[iType].url;
    anchorElement.href = this.images[iType].url;
  }

  //----------------------------------------------------------------------------
  // Character informatin table.
  //
  private async makeCharacterInfoTable() {
    // Get tbody element.
    const t = document.getElementById('Character_Table') as HTMLTableElement;

    // Clear existing table
    while (t.rows.length > 0) {
      t.deleteRow(0);
    }

    // Get character type.
    // const cType = this.getDoc<FsCharacterType>(this.character.type, FsCollectionName.CharacterTypes);
    const cType = this.firestore.getDataById(FsCollectionName.CharacterTypes, this.character.type) as FsCharacterType;

    // 1st row: Chaption.
    let tr = t.insertRow();
    let td = tr.insertCell();
    td.textContent = '基本情報';
    td.colSpan = 2;
    this.setTdStyle(td, TableCellType.h1);

    // 2nd row: Character name and rarerity.
    tr = t.insertRow();
    td = tr.insertCell();
    td.textContent = '名前 (レア)';
    this.setTdStyle(td);
    td = tr.insertCell();
    td.textContent = `${this.character.name} (★${this.character.rarerity})`;
    this.setTdStyle(td);

    // 3rd row: Weapon type.
    tr = t.insertRow();
    td = tr.insertCell();
    td.textContent = '武器タイプ';
    this.setTdStyle(td);
    td = tr.insertCell();
    td.textContent = this.makeWeaponTypeText(this.character.weaponType);
    this.setTdStyle(td);

    // 4th row: Character cost.
    tr = t.insertRow();
    td = tr.insertCell();
    td.textContent = '基本消費気';
    this.setTdStyle(td);
    td = tr.insertCell();
    td.textContent = this.makeCharacterCostText(this.character.type, this.character.cost, this.character.costKai);
    this.setTdStyle(td);

    // 5th row: Geograph type.
    tr = t.insertRow();
    td = tr.insertCell();
    td.textContent = '地形タイプ';
    this.setTdStyle(td);
    td = tr.insertCell();
    td.textContent = this.makeGeographTypeText(this.character.geographTypes);
    this.setTdStyle(td);

    // 6th row: Region.
    if (cType.regions.length > 0) {
      tr = t.insertRow();
      td = tr.insertCell();
      td.textContent = '地域';
      this.setTdStyle(td);
      td = tr.insertCell();
      td.textContent = this.makeRegionText(this.character.region);
      this.setTdStyle(td);
    }

    // 7th row: CV.
    tr = t.insertRow();
    td = tr.insertCell();
    td.textContent = 'ＣＶ';
    this.setTdStyle(td);
    td = tr.insertCell();
    this.makeTextLinkFromIds(td, this.character.voiceActors, FsCollectionName.VoiceActors);
    this.setTdStyle(td);

    // 8th row: Illustrator.
    tr = t.insertRow();
    td = tr.insertCell();
    td.textContent = 'イラスト';
    this.setTdStyle(td);
    td = tr.insertCell();
    this.makeTextLinkFromIds(td, this.character.illustrators, FsCollectionName.Illustrators);
    this.setTdStyle(td);

    // 9th row: Motif weapon.
    if (!cType.isItem) {
      tr = t.insertRow();
      td = tr.insertCell();
      td.textContent = 'モチーフ武器';
      this.setTdStyle(td);
      td = tr.insertCell();
      td.textContent = this.makeMotifWeaponText(this.character.motifWeapons);
      this.setTdStyle(td);
    }

    // 10th row: Motif facility.
    if (!cType.isItem) {
      tr = t.insertRow();
      td = tr.insertCell();
      td.textContent = 'モチーフ施設';
      this.setTdStyle(td);
      td = tr.insertCell();
      td.textContent = this.makeMotifFacilityText(this.character.motifFacilities);
      this.setTdStyle(td);
    }

    // 11th row: Tag.
    tr = t.insertRow();
    td = tr.insertCell();
    td.textContent = 'タグ';
    this.setTdStyle(td);
    td = tr.insertCell();
    this.makeCharacterTagLinks(td, this.character.tags);
    this.setTdStyle(td);

    // 12th row: Implemented date.
    tr = t.insertRow();
    td = tr.insertCell();
    td.textContent = '実装日';
    this.setTdStyle(td);
    td = tr.insertCell();
    td.textContent = this.makeImplementedDateText(this.character.implementedDate);
    this.setTdStyle(td);

    // 13th row: Ability caption.
    for (let i = 0; i < this.abilityTypes.length; ++i) {
      this.makeAbilityInfoRows(t, this.character, this.abilityTypes[i]);
    }
  }

  private setTdStyle(td: HTMLTableCellElement, type: TableCellType = TableCellType.data) {
    td.style.border = 'solid';
    td.style.borderWidth = 'thin';
    td.style.borderColor = 'var(--primary-color)';

    if (type === TableCellType.h1) {
      td.style.textAlign = 'center';
      td.style.backgroundColor = 'azure';
    }
  }

  private makeWeaponTypeText(id: string): string {
    return this.firestore.getDataById(FsCollectionName.WeaponTypes, id).name;
  }

  private makeCharacterCostText(typeId: string, cost: number, costKai: number): string {
    let result = `[無印] ${cost}`;

    const type = this.firestore.getDataById(FsCollectionName.CharacterTypes, typeId) as FsCharacterType;
    if (type.isKaichikuEnable) {
      result += ` / [改壱] ${costKai}`;
    }

    return result;
  }

  private makeGeographTypeText(ids: string[]): string {
    return this.makeTextFromIds(ids, FsCollectionName.GeographTypes);
  }

  private makeRegionText(id: string): string {
    return this.firestore.getDataById(FsCollectionName.Regions, id).name;
  }

  private makeVoicActorText(ids: string[]): string {
    return this.makeTextFromIds(ids, FsCollectionName.VoiceActors);
  }

  private makeIllustratorText(ids: string[]): string {
    return this.makeTextFromIds(ids, FsCollectionName.Illustrators);
  }

  private makeMotifWeaponText(ids: string[]): string {
    let result = '';

    if (ids.length === 0) {
      result = 'n.a.';
    } else {
      for (let i = 0; i < ids.length; ++i) {
        const item = this.firestore.getDataById(FsCollectionName.Weapons, ids[i]) as FsWeapon;
        if (i > 0) {
          result += ', ';
        }
        result += item.name;
        if (item.rarerity > 0) {
          result += ` (★${item.rarerity})`;
        }
      }
    }

    return result;
  }

  private makeMotifFacilityText(ids: string[]): string {
    let result = '';

    if (ids.length === 0) {
      result = 'n.a.';
    } else {
      // Collect facility information.
      let motifFacilities: { facility: FsFacility; type: FsFacilityType }[] = [];
      for (let i = 0; i < ids.length; ++i) {
        const fc = this.firestore.getDataById(FsCollectionName.Facilities, ids[i]) as FsFacility;
        const fcType = this.firestore.getDataById(FsCollectionName.FacilityTypes, fc.type) as FsFacilityType;
        motifFacilities.push({ facility: fc, type: fcType });
      }

      // Sort motif facilities by facility type.
      motifFacilities.sort((a, b) => {
        return a.type.code < b.type.code ? -1 : 1;
      });

      for (let i = 0; i < motifFacilities.length; ++i) {
        if (i > 0) {
          result += ', ';
        }
        const item = motifFacilities[i];
        result += `${item.facility.name} (★${item.facility.rarerity}|${item.type.name})`;
      }
    }

    return result;
  }

  private makeCharacterTagText(ids: string[]): string {
    return this.makeTextFromIds(ids, FsCollectionName.CharacterTags);
  }

  private makeCharacterTagLinks(td: HTMLTableCellElement, ids: string[]) {
    if (ids.length === 0) {
      td.textContent = 'n.a.';
      return;
    }

    for (let i = 0; i < ids.length; ++i) {
      if (i > 0) {
        HtmlElementUtil.appendTextNode(td, ', ');
      }

      const tagName = this.firestore.getDataById(FsCollectionName.CharacterTags, ids[i]).name;
      HtmlElementUtil.appendTextAnchor(td, tagName, `main/list-character/tag&${tagName}`);
    }
  }

  private makeTextFromIds(ids: string[], collectionName: FsCollectionName, separator: string = ', '): string {
    let result = '';

    if (ids.length === 0) {
      result = 'n.a.';
    } else {
      for (let i = 0; i < ids.length; ++i) {
        const item = this.firestore.getDataById(collectionName, ids[i]).name;
        if (item !== '') {
          if (i > 0) {
            result += separator;
          }
          result += item;
        }
      }
    }

    return result;
  }

  private makeTextLinkFromIds(
    td: HTMLTableCellElement,
    ids: string[],
    collectionName: FsCollectionName,
    separator: string = ', '
  ) {
    if (ids.length === 0) {
      HtmlElementUtil.appendTextNode(td, 'n.a.');
    } else {
      for (let i = 0; i < ids.length; ++i) {
        const item = this.firestore.getDataById(collectionName, ids[i]).name;
        if (item !== '') {
          if (i > 0) {
            HtmlElementUtil.appendTextNode(td, separator);
          }
          HtmlElementUtil.appendTextAnchor(td, item, `main/list-character/text&${item}`);
        }
      }
    }
  }

  private makeImplementedDateText(timestamp: any): string {
    let result = '';

    if (!timestamp) {
      result = 'n.a.';
    } else {
      result = this.firestore.convTimestampToDate(timestamp).toLocaleDateString();
    }

    return result;
  }

  private makeAbilityInfoRows(t: HTMLTableElement, character: FsCharacter, type: FsAbilityType) {
    // Filter abilities and abilities(kai).
    const abilities = this.abilities
      .filter((item) => character.abilities.includes(item.id))
      .filter((item) => item.type === type.id);
    const abilitiesKai = this.abilities
      .filter((item) => character.abilitiesKai.includes(item.id))
      .filter((item) => item.type === type.id);

    // Sort ability list by updated date.
    this.firestore.sortByTimestamp(abilities, 'updatedAt');
    this.firestore.sortByTimestamp(abilitiesKai, 'updatedAt');

    // CASE: No abilities. --> Do nothing.
    if (abilities.length === 0 && abilitiesKai.length === 0) {
      return;
    }

    // Make ability type caption.
    let tr = t.insertRow();
    let td = tr.insertCell();
    td.textContent = type.name;
    td.colSpan = 2;
    this.setTdStyle(td, TableCellType.h1);

    // Make ability name and description.
    let prevAbilityName = '';
    let prevAbilityDescCell: HTMLTableCellElement | undefined;
    for (let i = 0; i < abilities.length; ++i) {
      const ability = abilities[i];

      // Make ability name text.
      tr = t.insertRow();
      td = tr.insertCell();
      td.textContent = `[無印] ${ability.name}`;
      this.setTdStyle(td);

      // If previous ability is same, it expands row span.
      if (ability.name === prevAbilityName) {
        if (prevAbilityDescCell) {
          prevAbilityDescCell.rowSpan = 2;
        }
      }

      // Make ability description text.
      else {
        td = tr.insertCell();
        let descText = this.makeAbilityDescriptionText(ability.descriptions);

        // If the ability type is Keiryaku, add interval, cost, and token info.
        if (type.isKeiryaku) {
          descText += '\n' + this.makeKeiryakuPropertiesText(ability);
        }

        td.innerText = descText; // User 'innerText' property to activate line feed.
        this.setTdStyle(td);
      }

      // Update prev*** variables.
      prevAbilityName = ability.name;
      prevAbilityDescCell = td;
    }

    // Make ability info (kaichiku)
    for (let i = 0; i < abilitiesKai.length; ++i) {
      const ability = abilitiesKai[i];

      // Make ability name text.
      tr = t.insertRow();
      td = tr.insertCell();
      td.textContent = `[改壱] ${ability.name}`;
      this.setTdStyle(td);

      // If previous ability is same, it expands row span.
      if (ability.name === prevAbilityName) {
        if (prevAbilityDescCell) {
          prevAbilityDescCell.rowSpan = 2;
        }
      }

      // Make ability description text.
      else {
        td = tr.insertCell();
        let descText = this.makeAbilityDescriptionText(ability.descriptions);

        // If the ability type is Keiryaku, add interval, cost, and token info.
        if (type.isKeiryaku) {
          descText += '\n' + this.makeKeiryakuPropertiesText(ability);
        }

        td.innerText = descText; // User 'innerText' property to activate line feed.
        this.setTdStyle(td);
      }

      // Update prev*** variables.
      prevAbilityName = ability.name;
      prevAbilityDescCell = td;
    }
  }

  private makeAbilityDescriptionText(descriptions: string[]): string {
    let result = '';

    result = descriptions[0];
    for (let i = 1; i < descriptions.length; ++i) {
      result += '\n' + descriptions[i];
    }

    return result;
  }

  private makeKeiryakuPropertiesText(ability: FsAbility): string {
    let result = '';

    if (ability.tokenLayouts.length === 0) {
      result += `(CT:${ability.interval}秒 / 消費気:${ability.cost})`;
    } else {
      let tokenLayoutText = '';
      this.firestore.sortMapCellTypes(ability.tokenLayouts);
      for (let j = 0; j < ability.tokenLayouts.length; ++j) {
        if (j > 0) {
          tokenLayoutText += ',';
        }
        tokenLayoutText += ability.tokenLayouts[j];
      }
      result += `(CT:${ability.interval}秒 / 消費気:${ability.cost} / 配置:${tokenLayoutText})`;
    }

    return result;
  }

  //----------------------------------------------------------------------------
  // Confirmation dialog.
  //
  private showConfirmationDialog(message: string) {
    this.confirmationDialog.confirm({
      message: message,
      acceptLabel: 'OK',
      rejectVisible: false,
      accept: () => {
        this.hasThisCharacter = false;
      },
      reject: () => {
        this.hasThisCharacter = false;
      },
    });
  }

  //----------------------------------------------------------------------------
  // User character information.
  //
  private onUserSignedIn() {
    const location = `${this.className}.onUserSignedIn()`;
    this.logger.trace(location, { userData: this.userAuth.userData });

    this.updateHasCharacterSwitch();
  }

  private onUserSignedOut() {
    const location = `${this.className}.onUserSignedOut()`;
    this.logger.trace(location);

    this.updateHasCharacterSwitch();
  }

  private updateHasCharacterSwitch() {
    const location = `${this.className}.updateHasCharacterSwitch()`;
    this.logger.trace(location);

    // User information is empty, it always false.
    if (!this.userAuth.signedIn) {
      this.hasThisCharacter = false;
      return;
    }

    this.logger.debug(location, { signedIn: this.userAuth.signedIn, userData: this.userAuth.userData });

    // Set TRUE, if the user has this character.
    this.hasThisCharacter = this.userAuth.userData.characters.includes(this.id);
  }

  private async addToUserCharacterList(id: string): Promise<void> {
    const location = `${this.className}.addToUserCharacterList`;
    this.logger.trace(location, { id: id });

    if (this.userAuth.signedIn) {
      this.spinner.show();
      this.userAuth.userData.characters.push(id);
      this.logger.debug(location, { characters: this.userAuth.userData.characters });
      await this.firestore.updateField(
        FsCollectionName.Users,
        this.userAuth.userData.id,
        'characters',
        this.userAuth.userData.characters
      );
      await sleep(1000);
      this.spinner.hide();
    }
  }

  private async removeFromUserCharacterList(id: string): Promise<void> {
    const location = `${this.className}.removeFromUserCharacterList`;
    this.logger.trace(location, { id: id });

    if (this.userAuth.signedIn) {
      this.spinner.show();
      this.userAuth.userData.characters = this.userAuth.userData.characters.filter((item) => item !== id);
      this.logger.debug(location, { characters: this.userAuth.userData.characters });
      await this.firestore.updateField(
        FsCollectionName.Users,
        this.userAuth.userData.id,
        'characters',
        this.userAuth.userData.characters
      );
      await sleep(1000);
      this.spinner.hide();
    }
  }

  //----------------------------------------------------------------------------
  // Character data edit.
  //
  private convCharacterDataToFormData(src: FsCharacter): NewCharacterFormData {
    let result = new NewCharacterFormData();

    // Basic information.
    result.characterType = this.firestore.getDataById(FsCollectionName.CharacterTypes, src.type) as FsCharacterType;
    if (result.characterType.hasSubTypes) {
      result.subCharacterType = this.firestore.getDataById(
        FsCollectionName.SubCharacterTypes,
        src.subType
      ) as FsSubCharacterType;
    }
    result.characterName = src.name;
    result.rarerity = src.rarerity;
    result.weaponType = this.firestore.getDataById(FsCollectionName.WeaponTypes, src.weaponType) as FsWeaponType;
    result.geographTypes = [];
    for (let i = 0; i < src.geographTypes.length; ++i) {
      result.geographTypes.push(
        this.firestore.getDataById(FsCollectionName.GeographTypes, src.geographTypes[i]) as FsGeographType
      );
    }
    if (src.region !== '') {
      result.region = this.firestore.getDataById(FsCollectionName.Regions, src.region) as FsRegion;
    }
    result.cost = src.cost;
    result.costKai = src.costKai;
    result.implementedDate = src.implementedDate ? this.firestore.convTimestampToDate(src.implementedDate) : undefined;

    // Voice and illustration.
    if (src.voiceActors.length > 0) {
      result.voiceActor = this.firestore.getDataById(FsCollectionName.VoiceActors, src.voiceActors[0]) as FsVoiceActor;
    }
    if (src.illustrators.length > 0) {
      result.illustrator = this.firestore.getDataById(
        FsCollectionName.Illustrators,
        src.illustrators[0]
      ) as FsIllustrator;
    }

    // Motif weapons and facilities.
    result.motifWeapons = [];
    for (let i = 0; i < src.motifWeapons.length; ++i) {
      result.motifWeapons.push(this.firestore.getDataById(FsCollectionName.Weapons, src.motifWeapons[i]) as FsWeapon);
    }
    result.motifFacilities = [];
    for (let i = 0; i < src.motifFacilities.length; ++i) {
      result.motifFacilities.push(
        this.firestore.getDataById(FsCollectionName.Facilities, src.motifFacilities[i]) as FsFacility
      );
    }

    // Character tags.
    result.characterTags = [];
    for (let i = 0; i < src.tags.length; ++i) {
      result.characterTags.push(
        this.firestore.getDataById(FsCollectionName.CharacterTags, src.tags[i]) as FsCharacterTag
      );
    }

    // Abilities.
    result.abilities = [];
    for (let i = 0; i < src.abilities.length; ++i) {
      const ability = this.firestore.getDataById(
        FsCollectionName.Abilities,
        src.abilities[i]
      ) as FsAbilityForNewCharacterForm;
      ability.isExisting = false;
      ability.tokenAvailable = ability.tokenLayouts.length > 0 ? true : false;
      ability.typeName = this.firestore.getDataById(FsCollectionName.AbilityTypes, ability.type).name;
      result.abilities.push(ability);
    }

    // Abilities. (kaihchiku)
    result.abilitiesKai = [];
    for (let i = 0; i < src.abilitiesKai.length; ++i) {
      const ability = this.firestore.getDataById(
        FsCollectionName.Abilities,
        src.abilitiesKai[i]
      ) as FsAbilityForNewCharacterForm;
      ability.isExisting = false;
      ability.tokenAvailable = ability.tokenLayouts.length > 0 ? true : false;
      ability.typeName = this.firestore.getDataById(FsCollectionName.AbilityTypes, ability.type).name;
      result.abilitiesKai.push(ability);
    }

    return result;
  }

  private async updateCharacterData(): Promise<void> {
    const location = `${this.className}.updateCharacterData()`;
    const original = this.character;
    const modified = this.characterFormData;
    let changed = false;

    // Name.
    if (original.name !== modified.characterName) {
      await this.firestore.updateField(FsCollectionName.Characters, original.id, 'name', modified.characterName);
    }

    // Character type
    if (original.type !== modified.characterType.id) {
      await this.firestore.updateField(FsCollectionName.Characters, original.id, 'type', modified.characterType.id);
    }

    // Sub character type.
    if (original.subType !== modified.subCharacterType.id) {
      await this.firestore.updateField(
        FsCollectionName.SubCharacterTypes,
        original.id,
        'subType',
        modified.subCharacterType.id
      );
    }

    // Rarerity.
    if (original.rarerity !== modified.rarerity) {
      await this.firestore.updateField(FsCollectionName.Characters, original.id, 'rarerity', modified.rarerity);
    }

    // Weapon type.
    if (original.weaponType !== modified.weaponType.id) {
      await this.firestore.updateField(FsCollectionName.Characters, original.id, 'weaponType', modified.weaponType.id);
    }

    // Geograph types.
    changed = this.isListFieldChanged(original.geographTypes, modified.geographTypes);
    if (changed) {
      await this.firestore.updateField(
        FsCollectionName.Characters,
        original.id,
        'geographTypes',
        modified.geographTypes.map((item) => item.id)
      );
    }

    // Region.
    if (original.region !== modified.region.id) {
      await this.firestore.updateField(FsCollectionName.Characters, original.id, 'region', modified.region.id);
    }

    // Cost.
    if (original.cost !== modified.cost) {
      await this.firestore.updateField(FsCollectionName.Characters, original.id, 'cost', modified.cost);
    }
    if (original.costKai !== modified.costKai) {
      await this.firestore.updateField(FsCollectionName.Characters, original.id, 'costKai', modified.costKai);
    }

    // Voice actor.
    changed = this.isVoiceActorFieldChanged(original.voiceActors, modified.voiceActor);
    if (changed) {
      // Make target data.
      let data: string[] = [];
      if (modified.voiceActor.name !== '') {
        let tmpId = modified.voiceActor.id;
        if (tmpId === '') {
          tmpId = await this.firestore.addData(FsCollectionName.VoiceActors, modified.voiceActor);
        }
        data = [tmpId];
      }

      // Update.
      await this.firestore.updateField(FsCollectionName.Characters, original.id, 'voiceActors', data);
    }

    // Illustrator.
    changed = this.isIllustratorFieldChanged(original.illustrators, modified.illustrator);
    if (changed) {
      if (changed) {
        // Make target data.
        let data: string[] = [];
        if (modified.illustrator.name !== '') {
          let tmpId = modified.illustrator.id;
          if (tmpId === '') {
            tmpId = await this.firestore.addData(FsCollectionName.Illustrators, modified.illustrator);
          }
          data = [tmpId];
        }

        // Update.
        await this.firestore.updateField(FsCollectionName.Characters, original.id, 'illustrators', data);
      }
    }

    // Motif weapons.
    changed = this.isListFieldChanged(original.motifWeapons, modified.motifWeapons);
    if (changed) {
      for (let i = 0; i < modified.motifWeapons.length; ++i) {
        if (modified.motifWeapons[i].id === '') {
          this.logger.info(location, 'New weapon data added.', { weapon: modified.motifWeapons[i] });
          const docId = await this.firestore.addData(FsCollectionName.Weapons, modified.motifWeapons[i]);
          modified.motifWeapons[i].id = docId;
        }
      }

      await this.firestore.updateField(
        FsCollectionName.Characters,
        original.id,
        'motifWeapons',
        modified.motifWeapons.map((item) => item.id)
      );
    }

    // Motif facilities.
    changed = this.isListFieldChanged(original.motifFacilities, modified.motifFacilities);
    if (changed) {
      for (let i = 0; i < modified.motifFacilities.length; ++i) {
        if (modified.motifFacilities[i].id === '') {
          this.logger.info(location, 'New facility data added.', { facility: modified.motifFacilities[i] });
          const docId = await this.firestore.addData(FsCollectionName.Facilities, modified.motifFacilities[i]);
          modified.motifFacilities[i].id = docId;
        }
      }

      await this.firestore.updateField(
        FsCollectionName.Characters,
        original.id,
        'motifFacilities',
        modified.motifFacilities.map((item) => item.id)
      );
    }

    // Character tags.
    changed = this.isListFieldChanged(original.tags, modified.characterTags);
    if (changed) {
      // If new character tag is added, add tag data at first.
      for (let i = 0; i < modified.characterTags.length; ++i) {
        if (modified.characterTags[i].id === '') {
          this.logger.info(location, 'New character tag added.', { tag: modified.characterTags[i] });
          const docId = await this.firestore.addData(FsCollectionName.CharacterTags, modified.characterTags[i]);
          modified.characterTags[i].id = docId;
        }
      }

      // Update character data.
      await this.firestore.updateField(
        FsCollectionName.Characters,
        original.id,
        'tags',
        modified.characterTags.map((item) => item.id)
      );
    }

    // Implemented date.
    if (original.implementedDate !== modified.implementedDate) {
      await this.firestore.updateField(
        FsCollectionName.Characters,
        original.id,
        'implementedDate',
        modified.implementedDate // 'Date' data will be converted to 'Timestamp' data automatically.
      );
    }

    // Abilities.
    const abilities = await this.updateAbilities(original.abilities, modified.abilities);
    if (this.isStringsChanged(abilities, original.abilities)) {
      await this.firestore.updateField(FsCollectionName.Characters, original.id, 'abilities', abilities);
    }
    const abilitiesKai = await this.updateAbilities(original.abilitiesKai, modified.abilitiesKai);
    if (this.isStringsChanged(abilitiesKai, original.abilitiesKai)) {
      await this.firestore.updateField(FsCollectionName.Characters, original.id, 'abilitiesKai', abilitiesKai);
    }
  }

  private isListFieldChanged(a: string[], b: FsDocumentBase[]) {
    let result = false;

    if (a.length !== b.length) {
      result = true;
    }
    if (!result) {
      for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i].id) {
          result = true;
          break;
        }
      }
    }

    return result;
  }

  private isVoiceActorFieldChanged(originalIds: string[], modifiedData: FsVoiceActor): boolean {
    // CASE: Original voice acter IDs is empty.
    if (originalIds.length === 0) {
      if (modifiedData.name !== '') {
        return true;
      } else {
        return false;
      }
    }

    // CASE: Original voice acter IDs is not empty.
    else {
      if (modifiedData.name === '') {
        return true;
      } else if (originalIds[0] !== modifiedData.id) {
        return true;
      } else {
        return false;
      }
    }
  }

  private isIllustratorFieldChanged(originalIds: string[], modifiedData: FsIllustrator): boolean {
    // CASE: Original illustrator IDs is empty.
    if (originalIds.length === 0) {
      if (modifiedData.name !== '') {
        return true;
      } else {
        return false;
      }
    }

    // CASE: Original illustrator IDs is not empty.
    else {
      if (modifiedData.name === '') {
        return true;
      } else if (originalIds[0] !== modifiedData.id) {
        return true;
      } else {
        return false;
      }
    }
  }

  private async updateAbilities(original: string[], modified: FsAbility[]): Promise<string[]> {
    const abilityIdList: string[] = [];

    // Scan original ability info.
    for (let i = 0; i < original.length; ++i) {
      // If ability ID is not found, it removes ability.
      const modAbility = modified.find((item) => item.id === original[i]);
      if (!modAbility) {
        continue;
      }

      // Get ability information.
      const orgAbility = this.firestore.getDataById(FsCollectionName.Abilities, original[i]) as FsAbility;

      // If ability name is changed, make new ability.
      if (orgAbility.name !== modAbility.name) {
        const docId = await this.firestore.addData(FsCollectionName.Abilities, modAbility);
        abilityIdList.push(docId);
        continue;
      }

      // Add ability ID to the ID list.
      abilityIdList.push(orgAbility.id);

      // Ability type.
      if (orgAbility.type !== modAbility.type) {
        await this.firestore.updateField(FsCollectionName.Abilities, orgAbility.id, 'type', modAbility.type);
      }

      // Descriptions.
      if (this.isStringsChanged(orgAbility.descriptions, modAbility.descriptions)) {
        await this.firestore.updateField(
          FsCollectionName.Abilities,
          orgAbility.id,
          'descriptions',
          modAbility.descriptions
        );
      }

      // Interval.
      if (orgAbility.interval !== modAbility.interval) {
        await this.firestore.updateField(FsCollectionName.Abilities, orgAbility.id, 'interval', modAbility.interval);
      }

      // Cost.
      if (orgAbility.cost !== modAbility.cost) {
        await this.firestore.updateField(FsCollectionName.Abilities, orgAbility.id, 'cost', modAbility.cost);
      }

      // Token layouts.
      if (this.isStringsChanged(orgAbility.tokenLayouts, modAbility.tokenLayouts)) {
        await this.firestore.updateField(
          FsCollectionName.Abilities,
          orgAbility.id,
          'tokenLayouts',
          modAbility.tokenLayouts
        );
      }
    }

    // Scan modified ability info.
    for (let i = 0; i < modified.length; ++i) {
      // CASE: New ability is added.
      if (modified[i].id === '') {
        const docId = await this.firestore.addData(FsCollectionName.Abilities, modified[i]);
        abilityIdList.push(docId);
        modified[i].id = docId;
      }

      // CASE: Existing ability is added.
      else {
        if (!original.includes(modified[i].id)) {
          abilityIdList.push(modified[i].id);
        }
      }
    }

    // Update ability ID list.
    return abilityIdList;
  }

  private isStringsChanged(a: string[], b: string[]): boolean {
    if (a.length !== b.length) {
      return true;
    }
    for (let i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) {
        return true;
      }
    }

    return false;
  }

  //----------------------------------------------------------------------------
  // Character image edit.
  //
  private convCharacterImageToFormData(): NewCharacterFormData {
    let result = new NewCharacterFormData();

    for (let i = 0; i < this.images.length; ++i) {
      if (this.images[i].valid) {
        result.imageFiles[i] = new ImageDataWithProperty(this.images[i].data);
      }
    }

    result.thumbnailImage = new ImageDataWithProperty(this.thumbnail);

    return result;
  }

  private async uploadImages() {
    const location = `${this.className}.uploadImages()`;

    let path = '';

    // Character images.
    for (let i = 0; i < this.characterFormData.imageFiles.length; ++i) {
      const image = this.characterFormData.imageFiles[i];
      if (image.status === 'updated') {
        path = this.storage.makeCharacterImagePath(this.character.index, csCharacterImageTypes[i].type);
        this.logger.info(location, { path: path });
        await this.storage.upload(path, image.data);
        this.images[i].setImageData(image.data);
      }
    }

    // Thumbnail images.
    const thumb = this.characterFormData.thumbnailImage;
    if (thumb.status === 'updated') {
      path = this.storage.makeCharacterThumbnailPath(this.character.index);
      this.logger.info(location, { path: path });
      await this.storage.upload(path, thumb.data);
      this.thumbnail = thumb.data;
    }
  }
}
