import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { ConfirmationService } from 'primeng/api';
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
  FsFacility,
  FsFacilityType,
  FsGeographType,
  FsIllustrator,
  FsRegion,
  FsVoiceActor,
  FsWeapon,
  FsWeaponType,
} from 'src/app/services/firestore-data/firestore-document.interface';
import { SpinnerService } from '../../services/spinner/spinner.service';
import { UserAuthService } from '../../services/user-auth/user-auth.service';
import { sleep } from '../../utils/sleep/sleep.utility';

class CharacterImage {
  url = '';

  data: Blob = new Blob();

  valid = false;
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
  readonly className = 'CharacterComponent';

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

  /** Switch: own the character */
  hasThisCharacter: boolean = false;

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

      // Make character information table.
      this.makeCharacterInfoTable();

      // Start loading of character images.
      for (let i = 0; i < csCharacterImageTypes.length; ++i) {
        const path = this.storage.makeCharacterImagePath(this.character.index, csCharacterImageTypes[i].type);
        const data = await this.storage.get(path);
        if (data) {
          this.images[i].data = data;
          this.images[i].url = window.URL.createObjectURL(this.images[i].data);
          this.images[i].valid = true;

          // Draw 1st image.
          if (i === 0) {
            this.updateImage();
          }
        } else {
          this.images[i].valid = false;
        }
      }
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
        this.showConfirmationDialog();
      }
    }

    // CASE: Switch is unchecked.
    else {
      if (this.userAuth.signedIn) {
        this.removeFromUserCharacterList(this.character.id);
      }
    }
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

    this.logger.debug(location, this.images[iType]);
    imageElement.src = this.images[iType].url;
  }

  //----------------------------------------------------------------------------
  // Character informatin table.
  //
  private async makeCharacterInfoTable() {
    // Get tbody element.
    const t = document.getElementById('Character_Table') as HTMLTableElement;

    // Get character type.
    // const cType = this.getDoc<FsCharacterType>(this.character.type, FsCollectionName.CharacterTypes);
    const cType = this.firestore.getDataById(FsCollectionName.CharacterTypes, this.character.type) as FsCharacterType;

    // 1st row: Chaption.
    let tr = t.insertRow();
    let td = tr.insertCell();
    td.textContent = '????????????';
    td.colSpan = 2;
    this.setTdStyle(td, TableCellType.h1);

    // 2nd row: Character name and rarerity.
    tr = t.insertRow();
    td = tr.insertCell();
    td.textContent = '?????? (??????)';
    this.setTdStyle(td);
    td = tr.insertCell();
    td.textContent = `${this.character.name} (???${this.character.rarerity})`;
    this.setTdStyle(td);

    // 3rd row: Weapon type.
    tr = t.insertRow();
    td = tr.insertCell();
    td.textContent = '???????????????';
    this.setTdStyle(td);
    td = tr.insertCell();
    td.textContent = this.makeWeaponTypeText(this.character.weaponType);
    this.setTdStyle(td);

    // 4th row: Character cost.
    tr = t.insertRow();
    td = tr.insertCell();
    td.textContent = '???????????????';
    this.setTdStyle(td);
    td = tr.insertCell();
    td.textContent = this.makeCharacterCostText(this.character.type, this.character.cost, this.character.costKai);
    this.setTdStyle(td);

    // 5th row: Geograph type.
    tr = t.insertRow();
    td = tr.insertCell();
    td.textContent = '???????????????';
    this.setTdStyle(td);
    td = tr.insertCell();
    td.textContent = this.makeGeographTypeText(this.character.geographTypes);
    this.setTdStyle(td);

    // 6th row: Region.
    if (cType.regions.length > 0) {
      tr = t.insertRow();
      td = tr.insertCell();
      td.textContent = '??????';
      this.setTdStyle(td);
      td = tr.insertCell();
      td.textContent = this.makeRegionText(this.character.region);
      this.setTdStyle(td);
    }

    // 7th row: CV.
    tr = t.insertRow();
    td = tr.insertCell();
    td.textContent = '??????';
    this.setTdStyle(td);
    td = tr.insertCell();
    td.textContent = this.makeVoicActorText(this.character.voiceActors);
    this.setTdStyle(td);

    // 8th row: Illustrator.
    tr = t.insertRow();
    td = tr.insertCell();
    td.textContent = '????????????';
    this.setTdStyle(td);
    td = tr.insertCell();
    td.textContent = this.makeIllustratorText(this.character.illustrators);
    this.setTdStyle(td);

    // 9th row: Motif weapon.
    if (!cType.isItem) {
      tr = t.insertRow();
      td = tr.insertCell();
      td.textContent = '??????????????????';
      this.setTdStyle(td);
      td = tr.insertCell();
      td.textContent = this.makeMotifWeaponText(this.character.motifWeapons);
      this.setTdStyle(td);
    }

    // 10th row: Motif facility.
    if (!cType.isItem) {
      tr = t.insertRow();
      td = tr.insertCell();
      td.textContent = '??????????????????';
      this.setTdStyle(td);
      td = tr.insertCell();
      td.textContent = this.makeMotifFacilityText(this.character.motifFacilities);
      this.setTdStyle(td);
    }

    // 11th row: Tag.
    tr = t.insertRow();
    td = tr.insertCell();
    td.textContent = '??????';
    this.setTdStyle(td);
    td = tr.insertCell();
    td.textContent = this.makeCharacterTagText(this.character.tags);
    this.setTdStyle(td);

    // 12th row: Ability caption.
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
    let result = `[??????] ${cost}`;

    const type = this.firestore.getDataById(FsCollectionName.CharacterTypes, typeId) as FsCharacterType;
    if (type.isKaichikuEnable) {
      result += ` / [??????] ${costKai}`;
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
          result += ` (???${item.rarerity})`;
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
      for (let i = 0; i < ids.length; ++i) {
        const item = this.firestore.getDataById(FsCollectionName.Facilities, ids[i]) as FsFacility;
        const itemType = this.firestore.getDataById(FsCollectionName.FacilityTypes, item.type) as FsFacilityType;
        if (i > 0) {
          result += ', ';
        }
        result += `${item.name} (???${item.rarerity}|${itemType.name})`;
      }
    }

    return result;
  }

  private makeCharacterTagText(ids: string[]): string {
    return this.makeTextFromIds(ids, FsCollectionName.CharacterTags);
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

  private makeAbilityInfoRows(t: HTMLTableElement, character: FsCharacter, type: FsAbilityType) {
    // Filter abilities and abilities(kai).
    const abilities = this.abilities
      .filter((item) => character.abilities.includes(item.id))
      .filter((item) => item.type === type.id);
    const abilitiesKai = this.abilities
      .filter((item) => character.abilitiesKai.includes(item.id))
      .filter((item) => item.type === type.id);

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
      td.textContent = `[??????] ${ability.name}`;
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
          if (ability.tokenLayouts.length === 0) {
            descText += `\n(CT:${ability.interval}???/?????????:${ability.cost})`;
          } else {
            let tokenLayoutText = '';
            for (let j = 0; j < ability.tokenLayouts.length; ++j) {
              tokenLayoutText += ability.tokenLayouts[j];
            }
            descText += `\n(CT:${ability.interval}???/?????????:${ability.cost}/??????:${tokenLayoutText})`;
          }
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
      td.textContent = `[??????] ${ability.name}`;
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
          if (ability.tokenLayouts.length === 0) {
            descText += `\n(CT:${ability.interval}???/?????????:${ability.cost})`;
          } else {
            let tokenLayoutText = '';
            for (let j = 0; j < ability.tokenLayouts.length; ++j) {
              tokenLayoutText += ability.tokenLayouts[j];
            }
            descText += `\n(CT:${ability.interval}???/?????????:${ability.cost}/??????:${tokenLayoutText})`;
          }
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

  //----------------------------------------------------------------------------
  // Confirmation dialog.
  //
  private showConfirmationDialog() {
    this.confirmationDialog.confirm({
      message: '???????????????????????????????????????????????????????????????????????????????????????',
      acceptLabel: '??????',
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
}
