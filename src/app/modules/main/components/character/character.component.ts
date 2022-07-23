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
import { UserAuthService } from '../../services/user-auth/user-auth.service';

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

  private characterTags = this.firestore.getData(FsCollectionName.CharacterTags) as FsCharacterTag[];

  private characterTypes = this.firestore.getData(FsCollectionName.CharacterTypes) as FsCharacterType[];

  private facilities = this.firestore.getData(FsCollectionName.Facilities) as FsFacility[];

  private facilityTypes = this.firestore.getData(FsCollectionName.FacilityTypes) as FsFacilityType[];

  private geographTypes = this.firestore.getData(FsCollectionName.GeographTypes) as FsGeographType[];

  private illustrators = this.firestore.getData(FsCollectionName.Illustrators) as FsIllustrator[];

  private regions = this.firestore.getData(FsCollectionName.Regions) as FsRegion[];

  private voiceActors = this.firestore.getData(FsCollectionName.VoiceActors) as FsVoiceActor[];

  private weaponTypes = this.firestore.getData(FsCollectionName.WeaponTypes) as FsWeaponType[];

  private weapons = this.firestore.getData(FsCollectionName.Weapons) as FsWeaponType[];

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
    private auth: UserAuthService,
    private errorHandler: ErrorHandlerService,
    private confirmationDialog: ConfirmationService
  ) {
    this.logger.trace(`new ${this.className}()`);

    this.images = [];
    for (let i = 0; i < CsCharacterImageTypeMax; ++i) {
      this.images.push(new CharacterImage());
    }
  }

  ngOnInit(): void {
    // Get character ID from URL.
    const tmpId = this.route.snapshot.paramMap.get('id');
    if (tmpId) {
      this.id = tmpId;
    } else {
      this.errorHandler.notifyError(ErrorCode.NotFound, 'No character ID.');
    }

    // Sort ability type.
    this.firestore.sortByOrder(this.abilityTypes);
  }

  async ngAfterViewInit(): Promise<void> {
    const location = `${this.className}.ngAfterViewInit()`;
    this.logger.trace(location);

    // Load data if data loading is not finished.
    // Basically, this process is not needed. It's needed when user type URL directly.
    if (!this.firestore.loaded) {
      await this.firestore.loadAll();
    }

    // Get character information by character ID.
    try {
      this.character = this.firestore.getDataById(FsCollectionName.Characters, this.id) as FsCharacter;
    } catch {
      this.errorHandler.notifyError(ErrorCode.NotFound, `Invalid character ID: ${this.id}`);
    }

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
  }

  onImageTypeClick() {
    const location = `${this.className}.onImageTypeClick()`;
    this.logger.trace(location, { type: this.selectedImageType.type });

    this.updateImage();
  }

  onHasSwitchChange(event: any) {
    const location = `${this.className}.onCharacterHasSwitchChange()`;
    this.logger.trace(location, { value: event.checked });

    if (event.checked) {
      if (!this.auth.signedIn) {
        // Show warning message.
        this.confirmationDialog.confirm({
          message: 'キャラクター所持状況を管理するためにはログインが必要です。',
          acceptLabel: 'ＯＫ',
          rejectVisible: false,
          accept: () => {
            this.hasThisCharacter = false;
          },
        });
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
    td.textContent = this.makeVoicActorText(this.character.voiceActors);
    this.setTdStyle(td);

    // 8th row: Illustrator.
    tr = t.insertRow();
    td = tr.insertCell();
    td.textContent = 'イラスト';
    this.setTdStyle(td);
    td = tr.insertCell();
    td.textContent = this.makeIllustratorText(this.character.illustrators);
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
      for (let i = 0; i < ids.length; ++i) {
        const item = this.firestore.getDataById(FsCollectionName.Facilities, ids[i]) as FsFacility;
        const itemType = this.firestore.getDataById(FsCollectionName.FacilityTypes, item.type) as FsFacilityType;
        if (i > 0) {
          result += ', ';
        }
        result += `${item.name} (★${item.rarerity}|${itemType.name})`;
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
          if (ability.tokenLayouts.length === 0) {
            descText += `\n(CT:${ability.interval}秒/消費気:${ability.cost})`;
          } else {
            let tokenLayoutText = '';
            for (let j = 0; j < ability.tokenLayouts.length; ++j) {
              tokenLayoutText += ability.tokenLayouts[j];
            }
            descText += `\n(CT:${ability.interval}秒/消費気:${ability.cost}/配置:${tokenLayoutText})`;
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
          if (ability.tokenLayouts.length === 0) {
            descText += `\n(CT:${ability.interval}秒/消費気:${ability.cost})`;
          } else {
            let tokenLayoutText = '';
            for (let j = 0; j < ability.tokenLayouts.length; ++j) {
              tokenLayoutText += ability.tokenLayouts[j];
            }
            descText += `\n(CT:${ability.interval}秒/消費気:${ability.cost}/配置:${tokenLayoutText})`;
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
}
