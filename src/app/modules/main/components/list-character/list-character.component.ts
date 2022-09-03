import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { AppInfo } from 'src/app/app-info.enum';
import { CloudStorageService } from 'src/app/services/cloud-storage/cloud-storage.service';
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
import { CharacterFilterService } from '../../services/character-filter/character-filter.service';
import { NavigatorService } from '../../services/navigator/navigator.service';
import { SpinnerService } from '../../services/spinner/spinner.service';
import { UserAuthService } from '../../services/user-auth/user-auth.service';
import { PaginatorControl } from '../../utils/paginator-control/paginator-control.class';
import { sleep } from '../../utils/sleep/sleep.utility';
import { isMobileMode } from '../../utils/window-size/window-size.util';
import { CharacterFilterSettings } from '../../views/character-filter-settings-form/character-filter-settings-form.interface';
import { CharacterSortSettings } from '../../views/character-sort-settings-form/character-sort-settings-form.interface';

export class ThumbImageWrapper {
  url: string = '';

  data: Blob = new Blob();
}

export const defaultGidRowNum = 10;

export enum TableCellType {
  h1,
  h2,
  h3,
  data,
}

@Component({
  selector: 'app-list-character',
  templateUrl: './list-character.component.html',
  styleUrls: ['./list-character.component.scss'],
})
export class ListCharacterComponent implements OnInit, AfterViewInit {
  readonly className = 'ListCharacterComponent';

  appInfo = AppInfo;

  /** View status. */
  viewInited = false;

  thumbLoaded = false;

  /** Firestore data. */
  abilities = this.firestore.getData(FsCollectionName.Abilities) as FsAbility[];

  abilityTypes = this.firestore.getData(FsCollectionName.AbilityTypes) as FsAbilityType[];

  characterTags = this.firestore.getData(FsCollectionName.CharacterTags) as FsCharacterTag[];

  characterTypes = this.firestore.getData(FsCollectionName.CharacterTypes) as FsCharacterType[];

  characters = this.firestore.getData(FsCollectionName.Characters) as FsCharacter[];

  facilities = this.firestore.getData(FsCollectionName.Facilities) as FsFacility[];

  facilityTypes = this.firestore.getData(FsCollectionName.FacilityTypes) as FsFacilityType[];

  geographTypes = this.firestore.getData(FsCollectionName.GeographTypes) as FsGeographType[];

  illustrators = this.firestore.getData(FsCollectionName.Illustrators) as FsIllustrator[];

  regions = this.firestore.getData(FsCollectionName.Regions) as FsRegion[];

  voiceActors = this.firestore.getData(FsCollectionName.VoiceActors) as FsVoiceActor[];

  weaponTypes = this.firestore.getData(FsCollectionName.WeaponTypes) as FsWeaponType[];

  weapons = this.firestore.getData(FsCollectionName.Weapons) as FsWeapon[];

  /** Data view: header. */
  isListLayout = false;

  inputSearchText = '';

  /** Data view: contents. */
  filteredIndexes: number[] = [];

  thumbImages: ThumbImageWrapper[] = [];

  readonly dummyThumbUrl = './assets/no_image.png';

  ownershipStatues: boolean[] = [];

  /** Data view: footer. */
  paginator = new PaginatorControl();

  /** Filter dialog */
  showFilterDialog: boolean = false;

  filterSettings = new CharacterFilterSettings();

  filterSettingsCopy = new CharacterFilterSettings();

  /** Sort dialog */
  showSortDialog: boolean = false;

  sortSettings = new CharacterSortSettings();

  sortSettingsCopy = new CharacterSortSettings();

  //============================================================================
  // Class methods.
  //
  //----------------------------------------------------------------------------
  // Life-cycle hooks.
  //
  constructor(
    private logger: NGXLogger,
    private firestore: FirestoreDataService,
    private storage: CloudStorageService,
    private router: Router,
    private navigator: NavigatorService,
    private userAuth: UserAuthService,
    private spinner: SpinnerService,
    private characterFilter: CharacterFilterService
  ) {
    this.logger.trace(`new ${this.className}()`);

    // Initialize filter service.
    this.filteredIndexes = this.characterFilter.filter(this.characters, this.filterSettings, '');

    // Thumbnail image info.
    for (let i = 0; i < this.characters.length; ++i) {
      this.thumbImages.push(new ThumbImageWrapper());
    }
  }

  async ngOnInit(): Promise<void> {
    const location = `${this.className}.ngOnInit()`;
    this.logger.trace(location);

    this.characters.sort((a, b) => {
      return a.index < b.index ? -1 : 1;
    });
  }

  async ngAfterViewInit(): Promise<void> {
    const location = `${this.className}.ngAfterViewInit()`;
    this.logger.trace(location);

    // Set view initialized flag.
    this.viewInited = true;

    // Sort ability types.
    this.firestore.sortByOrder(this.abilityTypes);

    // Restore paginator if stored.
    if (this.navigator.paramStorage['list-character']) {
      this.restorePageParameter();
    }

    // Else, calculate num of thumbnails per page.
    else {
      await sleep(10);
      this.paginator.rowNum = this.calcGridRowNum();
    }
    this.ownershipStatues = Array(this.paginator.rowNum);
    this.ownershipStatues.fill(true);
    await sleep(10);

    // Update thumbnail images.
    await this.loadThumbImages();
    this.updateThumbImages();
    this.makeCharacterInfoTables();
    this.updateOwnershipStatuses();
  }

  //----------------------------------------------------------------------------
  // Pagenator.
  //
  async onPageChange(event: any) {
    const location = `${this.className}.onPageChange()`;
    this.logger.trace(location, event);

    if (this.paginator.pageIndex !== event.page) {
      // Update paginate info.
      this.paginator.firstItemIndex = event.first;
      this.paginator.pageIndex = event.page;

      // Update thumbnail images.
      await this.loadThumbImages();
      this.updateThumbImages();
      this.makeCharacterInfoTables();

      this.updateOwnershipStatuses();

      // Scroll.
      this.scrollToTop();
    }
  }

  //----------------------------------------------------------------------------
  // Contents.
  //
  onThumbnailClick(i: number) {
    const location = `${this.className}.onThumbnailClick()`;
    this.logger.trace(location, { i: i });

    // Store paginator param.
    this.storePageParameter();

    // Go to character page.
    const iFilter = this.paginator.firstItemIndex + i;
    const id = this.characters[this.filteredIndexes[iFilter]].id;
    this.router.navigateByUrl(`main/character/${id}`);
  }

  //----------------------------------------------------------------------------
  // Filtering and sorting.
  //
  onFilterButtonClick() {
    // Copy filter settings.
    this.filterSettingsCopy = { ...this.filterSettings };

    this.showFilterDialog = true;
  }

  async onFilterSettingsDialogResult(canceled: boolean) {
    const location = `${this.className}.onFilterSettingsDialogResult()`;

    // Close dialog.
    this.showFilterDialog = false;

    // Restore filter settings if canceled.
    if (canceled) {
      this.filterSettings = { ...this.filterSettingsCopy };
      this.logger.trace(location, { filter: this.filterSettings, queryText: this.inputSearchText });
      return;
    }
    this.logger.trace(location, { filter: this.filterSettings, queryText: this.inputSearchText });

    // Show spinner.
    this.spinner.show();

    // Filter characters.
    this.filteredIndexes = this.characterFilter.filter(this.characters, this.filterSettings, this.inputSearchText);

    // Update paginate info.
    this.paginator.goToFirstPage();

    // Update thumbnail images.
    await this.loadThumbImages();
    this.updateThumbImages();
    this.makeCharacterInfoTables();
    this.updateOwnershipStatuses();

    // Hide spinner.
    this.spinner.hide();
  }

  onTextSearchButtonClick() {
    this.onFilterSettingsDialogResult(false);
  }

  onSearchTextClearButtonClick() {
    this.inputSearchText = '';
    this.onTextSearchButtonClick();
  }

  onSortButtonClick() {
    // Copy sort settings.
    this.sortSettingsCopy = { ...this.sortSettings };

    this.showSortDialog = true;
  }

  async onSortSettingsDialogResult(canceled: boolean) {
    const location = `${this.className}.onSortSettingsDialogResult()`;

    // Close dialog.
    this.showSortDialog = false;

    // Restore original setting if canceled.
    if (canceled) {
      this.sortSettings = { ...this.sortSettingsCopy };
      this.logger.trace(location, { filter: this.sortSettings });
      return;
    }
    this.logger.trace(location, { filter: this.sortSettings });

    // Show spinner.
    this.spinner.show();

    // Sort characters and filtered index list.
    this.filteredIndexes = this.characterFilter.sort(this.characters, this.sortSettings);

    // Update paginate info.
    this.paginator.goToFirstPage();

    // Update thumbnail images.
    await this.loadThumbImages();
    this.updateThumbImages();
    this.makeCharacterInfoTables();
    this.updateOwnershipStatuses();

    // Hide spinner.
    this.spinner.hide();
  }

  //============================================================================
  // Private methods.
  //
  //----------------------------------------------------------------------------
  // Thumbnail image control.
  //
  private async loadThumbImages(): Promise<number> {
    const location = `${this.className}.loadThumbImages()`;

    const promises: Promise<Blob | undefined>[] = [];
    let thumbCount = 0;

    for (let i = 0; i < this.paginator.rowNum; ++i) {
      // Exit loop if out of filtered index list.
      if (i + this.paginator.firstItemIndex >= this.filteredIndexes.length) {
        break;
      }

      // Call image load function and store the returned promise.
      const index = this.characters[this.filteredIndexes[i + this.paginator.firstItemIndex]].index;
      const path = this.storage.makeCharacterThumbnailPath(index);
      promises.push(this.storage.get(path));
      thumbCount++;
    }

    // Wait all promises.
    const blobs = await Promise.all(promises);

    // Store thumnail images.
    for (let i = 0; i < thumbCount; ++i) {
      const index = this.filteredIndexes[i + this.paginator.firstItemIndex];
      if (blobs[i]) {
        this.thumbImages[index].data = blobs[i] as Blob;
        this.thumbImages[index].url = window.URL.createObjectURL(blobs[i] as Blob);
      } else {
        this.thumbImages[index].url = this.dummyThumbUrl;
      }
    }

    // Set flag.
    this.thumbLoaded = true;

    this.logger.info(location, 'Thumbnail images are loaded.', { count: thumbCount });

    return thumbCount;
  }

  private updateThumbImages() {
    const location = `${this.className}.updateThumbImages()`;

    // Precondition.
    if (!this.thumbLoaded) {
      throw Error(`${location} Image shall be loaded beforehand.`);
    }
    if (!this.viewInited) {
      throw Error(`${location} View shall be initialized beforehand.`);
    }

    // Update image element on HTML.
    for (let i = 0; i < this.paginator.rowNum; ++i) {
      // Get image element.
      const img = document.getElementById(`ListCharacter_Thumb_${i}`) as HTMLImageElement;
      const div = document.getElementById(`ListCharacter_ThumbBox_${i}`) as HTMLDivElement;
      if (!img) {
        throw Error(`${location} Image element is not available.`);
      }

      // Set image URL to the image element.
      // Hide image element if the index is out of range.
      if (i + this.paginator.firstItemIndex < this.filteredIndexes.length) {
        const iCharacter = this.filteredIndexes[i + this.paginator.firstItemIndex];
        img.src = this.thumbImages[iCharacter].url;
        img.hidden = false;
        div.hidden = false;
      } else {
        img.hidden = true;
        div.hidden = true;
      }
    }
  }

  //----------------------------------------------------------------------------
  // Character information table.
  //
  private makeCharacterInfoTables() {
    const location = `${this.className}.makeCharacterInfoTable()`;

    // Precondition.
    if (!this.viewInited) {
      throw Error(`${location} View shall be initialized beforehand.`);
    }

    // Make table for each characters.
    for (let i = 0; i < this.paginator.rowNum; ++i) {
      const tableId = `ListCharacter_Table_${i}`;
      if (i + this.paginator.firstItemIndex < this.filteredIndexes.length) {
        // Make character table for 'a' character.
        const iCharacter = this.filteredIndexes[i + this.paginator.firstItemIndex];
        this.makeCharacterInfoTable(tableId, iCharacter);
      } else {
        // Clear table.
        this.clearTable(tableId);
      }
    }
  }

  private makeCharacterInfoTable(tableId: string, iCharacter: number) {
    const character = this.characters[iCharacter];
    const cType = this.characterTypes.find((item) => item.id === character.type);

    // Clear table.
    this.clearTable(tableId);

    // Get tbody element.
    const t = document.getElementById(tableId) as HTMLTableElement;

    // 1st row: Character name.
    let tr = t.insertRow();
    let td = tr.insertCell();
    td.textContent = `${character.name} (★${character.rarerity})`;
    td.colSpan = 2;
    this.setTdStyle(td, TableCellType.h1);

    // 2nd row: Basic information.
    tr = t.insertRow();
    td = tr.insertCell();
    td.textContent = '基本情報';
    this.setTdStyle(td);
    td = tr.insertCell();
    td.textContent = this.makeBasicInfoText(character);
    this.setTdStyle(td);

    // 3rd row: Motif weapons and facilities.
    if (cType && !cType.isItem) {
      tr = t.insertRow();
      td = tr.insertCell();
      td.textContent = 'モチーフ武器/施設';
      this.setTdStyle(td);
      td = tr.insertCell();
      td.textContent = this.makeMotifWeaponAndFacilityText(character);
      this.setTdStyle(td);
    }

    // 4th row: Tag inforamtion.
    tr = t.insertRow();
    td = tr.insertCell();
    td.textContent = 'タグ';
    this.setTdStyle(td);
    td = tr.insertCell();
    td.textContent = this.makeCharacterTagText(character);
    this.setTdStyle(td);

    // Make ability info rows.
    for (let i = 0; i < this.abilityTypes.length; ++i) {
      this.makeAbilityInfoRows(t, character, this.abilityTypes[i]);
    }
  }

  private clearTable(tableId: string) {
    const t = document.getElementById(tableId) as HTMLTableElement;

    while (t.rows.length > 0) {
      t.deleteRow(0);
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

  private makeBasicInfoText(character: FsCharacter): string {
    let result = '';

    // Get character type.
    const characterType = this.characterTypes.find((item) => item.id === character.type);

    // Weapon type.
    if (character.weaponType !== '') {
      let tmp = '武器タイプ: ';
      let wt = this.weaponTypes.find((item) => item.id === character.weaponType);
      tmp += wt ? wt.name : 'n.a.';
      result += tmp;
    }

    // Geograph types.
    if (character.geographTypes.length > 0) {
      let tmp = ', 地形タイプ: ';
      for (let i = 0; i < character.geographTypes.length; ++i) {
        let gt = this.geographTypes.find((item) => item.id === character.geographTypes[i]);
        if (i > 0) {
          tmp += '/';
        }
        tmp += gt ? gt.name : 'n.a.';
      }
      result += tmp;
    }

    // Region
    if (character.region !== '') {
      let tmp = ', 地域: ';
      let rg = this.regions.find((item) => item.id === character.region);
      tmp += rg ? rg.name : 'n.a.';
      result += tmp;
    }

    // Cost.
    if (character.cost > 0) {
      let tmp = `, コスト: ${character.cost}`;
      if (characterType?.isKaichikuEnable) {
        tmp += `/${character.costKai}(改)`;
      }
      result += tmp;
    }

    // CV.
    if (character.voiceActors.length > 0) {
      let tmp = `, CV: `;
      if (character.voiceActors.length >= 2) {
        tmp += '[';
      }
      for (let i = 0; i < character.voiceActors.length; ++i) {
        if (i > 0) {
          tmp += ', ';
        }
        const cv = this.voiceActors.find((item) => item.id === character.voiceActors[i]);
        tmp += cv ? cv.name : 'n.a.';
      }
      if (character.voiceActors.length >= 2) {
        tmp += ']';
      }
      result += tmp;
    }

    // Illustrator.
    if (character.illustrators.length > 0) {
      let tmp = `, イラスト: `;
      if (character.illustrators.length >= 2) {
        tmp += '[';
      }
      for (let i = 0; i < character.illustrators.length; ++i) {
        if (i > 0) {
          tmp += ', ';
        }
        const illustrator = this.illustrators.find((item) => item.id === character.illustrators[i]);
        tmp += illustrator ? illustrator.name : 'n.a.';
      }
      if (character.illustrators.length >= 2) {
        tmp += ']';
      }
      result += tmp;
    }

    return result;
  }

  private makeMotifWeaponAndFacilityText(character: FsCharacter): string {
    let result = '';

    // No motif weapons and facilities.
    if (character.motifWeapons.length === 0 && character.motifFacilities.length === 0) {
      return 'なし';
    }

    // Motif weapons.
    if (character.motifWeapons.length > 0) {
      let tmp = '';
      for (let i = 0; i < character.motifWeapons.length; ++i) {
        const wp = this.weapons.find((item) => item.id === character.motifWeapons[i]);
        if (wp) {
          if (i > 0 || result.length > 0) {
            tmp += ', ';
          }
          tmp += wp.name;
        }
      }
      result += tmp;
    }

    // Motif facilities.
    if (character.motifFacilities.length > 0) {
      let tmp = '';
      for (let i = 0; i < character.motifFacilities.length; ++i) {
        const fc = this.facilities.find((item) => item.id === character.motifFacilities[i]);
        if (fc) {
          const fcType = this.facilityTypes.find((item) => item.id === fc.type);
          if (fcType) {
            if (i > 0 || result.length > 0) {
              tmp += ', ';
            }
            tmp += `${fc.name}(${fcType.name})`;
          }
        }
      }
      result += tmp;
    }

    return result;
  }

  private makeCharacterTagText(character: FsCharacter): string {
    let result = '';

    // CASE: No character tags.
    if (character.tags.length === 0) {
      return 'なし';
    }

    // CASE: Make character tag text.
    else {
      for (let i = 0; i < character.tags.length; ++i) {
        const tag = this.characterTags.find((item) => item.id === character.tags[i]);
        if (tag) {
          if (i > 0) {
            result += ', ';
          }
          result += tag.name;
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
          if (ability.tokenLayouts.length === 0) {
            descText += `\n(CT:${ability.interval}秒/消費気:${ability.cost})`;
          } else {
            let tokenLayoutText = '';
            this.firestore.sortMapCellTypes(ability.tokenLayouts);
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
            this.firestore.sortMapCellTypes(ability.tokenLayouts);
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

  getAbilityTypeId(typeName: string): string {
    const location = `${this.className}.getAbilityTypeId()`;
    let result = '';

    const ability = this.abilityTypes.find((item) => item.name === typeName);
    if (ability) {
      result = ability.id;
    } else {
      this.logger.error(location, 'Ability type ID not found.', {
        typeName: typeName,
        abilityTypes: this.abilityTypes,
      });
    }

    return result;
  }

  private makeAbilityDescriptionText(descriptions: string[]): string {
    let result = '';

    // CASE: Mobile mode.
    // When text length > 18 full characters, no line feed is added.
    if (isMobileMode()) {
      result = descriptions[0];
      let prevLine = descriptions[0];
      for (let i = 1; i < descriptions.length; ++i) {
        if (this.getTextLengthUtf8(prevLine) <= 18 * 2) {
          result += '\n';
        }
        result += descriptions[i];
        prevLine = descriptions[i];
      }
    }

    // CASE: PC mode.
    // Connect all lines with line feeds.
    else {
      result = descriptions[0];
      for (let i = 1; i < descriptions.length; ++i) {
        result += '\n' + descriptions[i];
      }
    }

    return result;
  }

  /**
   * It calculate text length.
   * It counts a half character as 1, and counts a full character as 2.
   * @param text Input text.
   * @returns Text length.
   */
  private getTextLengthUtf8(text: string): number {
    let count = 0;
    let c = 0;

    for (let i = 0, len = text.length; i < len; i++) {
      c = text.charCodeAt(i);
      if ((c >= 0x0 && c < 0x81) || c == 0xf8f0 || (c >= 0xff61 && c < 0xffa0) || (c >= 0xf8f1 && c < 0xf8f4)) {
        count += 1;
      } else {
        count += 2;
      }
    }

    return count;
  }

  //----------------------------------------------------------------------------
  // Grid layout control.
  //
  private calcGridRowNum(): number {
    const location = `${this.className}.calcGridRowNum()`;
    let result = defaultGidRowNum;

    // Get screen mode.
    const mobileMode = isMobileMode();

    // Get div size.
    const dw = this.getHtmlElementWidth('ListCharacter_Content') - 1;
    const dh = this.getHtmlElementHeight('ListCharacter_Content') - 1;
    this.logger.debug(location, { dw: dw, dh: dh });

    // Calc image size and gaps.
    let iw = mobileMode ? 80 : 105;
    let ih = iw;
    let gw = mobileMode ? 6 : 12;
    let gh = gw;

    // Calc number of images.
    let columnNum = 1 + Math.floor((dw - iw) / (iw + gw));
    let rowNum = 1 + Math.floor((dh - ih) / (ih + gh));

    // columns x rows = total image count.
    result = columnNum * rowNum;

    return result;
  }

  private getHtmlElementWidth(id: string): number {
    let width = 0;

    let element = document.getElementById(id);
    if (element) {
      width = element.clientWidth;
    }

    return width;
  }

  private getHtmlElementHeight(id: string): number {
    let height = 0;

    let element = document.getElementById(id);
    if (element) {
      height = element.clientHeight;
    }

    return height;
  }

  //----------------------------------------------------------------------------
  // Uset data.
  //
  private updateOwnershipStatuses() {
    this.ownershipStatues = Array(this.paginator.rowNum);
    this.ownershipStatues.fill(true);

    if (!this.userAuth.signedIn) {
      return;
    }

    const userData = this.userAuth.userData.characters;

    for (let i = 0; i < this.paginator.rowNum; ++i) {
      if (i + this.paginator.firstItemIndex >= this.filteredIndexes.length) {
        break;
      }

      const characterId = this.characters[this.filteredIndexes[i + this.paginator.firstItemIndex]].id;
      this.ownershipStatues[i] = userData.includes(characterId);
    }
  }

  //----------------------------------------------------------------------------
  // Other utilities.
  //
  private scrollToTop() {
    this.logger.trace('scrollToTop()');
    document.getElementById('ListCharacter_Content')?.scrollTo({ top: 0, behavior: 'auto' });
  }

  private storePageParameter() {
    this.navigator.paramStorage['list-character'] = {
      paginator: this.paginator,
      isListLayout: this.isListLayout,
      filterSettings: this.filterSettings,
      inputSearchText: this.inputSearchText,
      sortSettings: this.sortSettings,
    };
  }

  private restorePageParameter() {
    this.paginator = this.navigator.paramStorage['list-character'].paginator;
    this.isListLayout = this.navigator.paramStorage['list-character'].isListLayout;
    this.filterSettings = this.navigator.paramStorage['list-character'].filterSettings;
    this.inputSearchText = this.navigator.paramStorage['list-character'].inputSearchText;
    this.sortSettings = this.navigator.paramStorage['list-character'].sortSettings;
    this.filteredIndexes = this.characterFilter.filter(this.characters, this.filterSettings, this.inputSearchText);
    this.filteredIndexes = this.characterFilter.sort(this.characters, this.sortSettings);
  }
}
