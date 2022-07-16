import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
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
  FsWeaponType,
} from 'src/app/services/firestore-data/firestore-document.interface';

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

  //============================================================================
  // Class methods.
  //
  constructor(
    private logger: NGXLogger,
    private firestore: FirestoreDataService,
    private storage: CloudStorageService,
    private route: ActivatedRoute,
    private errorHandler: ErrorHandlerService
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
    const tmpCharacter = this.firestore.getDataById(FsCollectionName.Characters, this.id);
    if (tmpCharacter) {
      this.character = tmpCharacter;
    } else {
      this.errorHandler.notifyError(ErrorCode.NotFound, `Invalid character ID: ${this.id}`);
    }

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

    // Make character information table.
    this.makeCharacterInfoTable();
  }

  onImageTypeClick() {
    const location = `${this.className}.onImageTypeClick()`;
    this.logger.trace(location, { type: this.selectedImageType.type });

    this.updateImage();
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
  private makeCharacterInfoTable() {
    // Get tbody element.
    const t = document.getElementById('Character_Table') as HTMLTableElement;

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

    // 5th row: Geograph type.
    tr = t.insertRow();
    td = tr.insertCell();
    td.textContent = '地形タイプ';
    this.setTdStyle(td);
    td = tr.insertCell();
    td.textContent = this.makeGeographTypeText(this.character.geographTypes);
    this.setTdStyle(td);

    // 6th row: Region.
    tr = t.insertRow();
    td = tr.insertCell();
    td.textContent = '地域';
    this.setTdStyle(td);
    td = tr.insertCell();
    td.textContent = this.makeRegionText(this.character.region);
    this.setTdStyle(td);

    // 7th row: CV.
    tr = t.insertRow();
    td = tr.insertCell();
    td.textContent = 'CV';
    this.setTdStyle(td);
    td = tr.insertCell();
    td.textContent = this.makeVoicActorText(this.character.voiceActors);
    this.setTdStyle(td);

    // 8th row: Illustrator.
    tr = t.insertRow();
    td = tr.insertCell();
    td.textContent = 'イラストレーター';
    this.setTdStyle(td);
    td = tr.insertCell();
    td.textContent = this.makeIllustratorText(this.character.illustrators);
    this.setTdStyle(td);
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
    return this.getDocName(id, FsCollectionName.WeaponTypes);
  }

  private makeGeographTypeText(ids: string[]): string {
    let result = '';

    for (let i = 0; i < ids.length; ++i) {
      const gType = this.getDocName(ids[i], FsCollectionName.GeographTypes);
      if (gType !== '') {
        if (i > 0) {
          result += ' / ';
        }
        result += gType;
      }
    }

    return result;
  }

  private makeRegionText(id: string): string {
    return this.getDocName(id, FsCollectionName.Regions);
  }

  private makeVoicActorText(ids: string[]): string {
    let result = '';

    if (ids.length > 0) {
      result = this.getDocName(ids[0], FsCollectionName.VoiceActors);
    }
    if (result === '') {
      result = 'n.a.';
    }

    return result;
  }

  private makeIllustratorText(ids: string[]): string {
    let result = '';

    if (ids.length > 0) {
      result = this.getDocName(ids[0], FsCollectionName.Illustrators);
    }
    if (result === '') {
      result = 'n.a.';
    }

    return result;
  }

  private getDocName(id: string, collectionName: FsCollectionName): string {
    let result = '';

    const collection = this.firestore.getData(collectionName);
    const document = collection.find((item) => item.id === id);
    if (document) {
      result = document.name;
    }

    return result;
  }
}
