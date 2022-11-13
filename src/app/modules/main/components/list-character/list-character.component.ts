import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  FsRegion,
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
import { CharacterFilterSettingsFormComponent } from '../../views/character-filter-settings-form/character-filter-settings-form.component';
import { CharacterFilterSetting } from '../../views/character-filter-settings-form/character-filter-settings-form.interface';
import { CharacterSortSettingsFormComponent } from '../../views/character-sort-settings-form/character-sort-settings-form.component';
import { CharacterSortSetting } from '../../views/character-sort-settings-form/character-sort-settings-form.interface';
import { HtmlElementUtil } from '../../utils/html-element-util/html-element-util.class';

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

  /** Filter settings form. */
  @ViewChild(CharacterFilterSettingsFormComponent) private filterSettingsForm!: CharacterFilterSettingsFormComponent;

  /** Sort settings form. */
  @ViewChild(CharacterSortSettingsFormComponent) private sortSettingsForm!: CharacterSortSettingsFormComponent;

  /** View status. */
  viewInited = false;

  thumbLoaded = false;

  /** Firestore data. */
  abilities = this.firestore.getData(FsCollectionName.Abilities) as FsAbility[];

  abilityTypes = this.firestore.getData(FsCollectionName.AbilityTypes) as FsAbilityType[];

  characters = this.firestore.getData(FsCollectionName.Characters) as FsCharacter[];

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

  filterSetting = new CharacterFilterSetting();

  filterSettingCopy = new CharacterFilterSetting();

  /** Sort dialog */
  showSortDialog: boolean = false;

  sortSetting = new CharacterSortSetting();

  sortSettingCopy = new CharacterSortSetting();

  /** Team edit values. */
  teamCheckFlags!: number[][];

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
    private route: ActivatedRoute,
    private navigator: NavigatorService,
    private userAuth: UserAuthService,
    private spinner: SpinnerService,
    private characterFilter: CharacterFilterService
  ) {
    this.logger.trace(`new ${this.className}()`);

    // Initialize filter service.
    this.filteredIndexes = this.characterFilter.filter(this.characters, this.filterSetting, '');

    // Thumbnail image info.
    for (let i = 0; i < this.characters.length; ++i) {
      this.thumbImages.push(new ThumbImageWrapper());
    }
  }

  async ngOnInit(): Promise<void> {
    const location = `${this.className}.ngOnInit()`;

    // Get character tag info from URL parameter.
    const query = this.route.snapshot.paramMap.get('query');
    if (query && (query.match(/&/g) || []).length === 1) {
      const queryParams = query.split('&');

      this.logger.trace(location, { type: queryParams[0], value: queryParams[1] });

      // If tag parameter is input,
      // (1) Set tag name to the text input field.
      // (2) Overwrite stored page parameter. It will be readout at ngAfterViewInit().
      if (queryParams[0] === 'tag') {
        this.inputSearchText = `#${queryParams[1]}`;
      } else if (queryParams[0] === 'text') {
        this.inputSearchText = `${queryParams[1]}`;
      }
      this.storePageParameter();
    } else {
      this.logger.trace(location);
    }

    // Sort characters by index as a default behavior.
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
    // else {
    await sleep(10);
    this.paginator.rowNum = this.calcGridRowNum();
    // }
    this.ownershipStatues = Array(this.paginator.rowNum);
    this.ownershipStatues.fill(true);
    await sleep(10);

    // Make team check flags array.
    this.teamCheckFlags = new Array(3);
    for (let i = 0; i < this.teamCheckFlags.length; ++i) {
      this.teamCheckFlags[i] = [];
    }

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
    this.filterSettingCopy = { ...this.filterSetting };

    this.showFilterDialog = true;
  }

  async onFilterSettingsDialogResult(canceled: boolean) {
    const location = `${this.className}.onFilterSettingsDialogResult()`;

    // Close dialog.
    this.showFilterDialog = false;

    // Restore filter settings if canceled.
    if (canceled) {
      this.filterSetting = { ...this.filterSettingCopy };
      this.logger.trace(location, { filter: this.filterSetting, queryText: this.inputSearchText });
      return;
    }
    this.logger.trace(location, { filter: this.filterSetting, queryText: this.inputSearchText });

    // Show spinner.
    this.spinner.show();

    // Filter characters.
    this.filteredIndexes = this.characterFilter.filter(this.characters, this.filterSetting, this.inputSearchText);

    // Auto-sorting.
    if (this.characterFilter.updateSortSettingFromFilterSetting(this.filterSetting, this.inputSearchText, this.sortSetting)) {
      this.filteredIndexes = this.characterFilter.sort(this.characters, this.sortSetting);
    }

    // Update paginate info.
    this.paginator.goToFirstPage();

    // Update thumbnail images.
    await this.updateCharacterListPage();

    // Hide spinner.
    this.spinner.hide();
  }

  onFilterSettingsOkButtonClick() {
    this.filterSettingsForm.onOkClick();
  }

  onFilterSettingsClearButtonClick() {
    this.filterSettingsForm.onClearClick();
  }

  onFilterSettingsCancelButtonClick() {
    this.filterSettingsForm.onCancelClick();
  }

  onTextSearchButtonClick() {
    this.onFilterSettingsDialogResult(false);
    document.getElementById('ListCharacter_SearchTextInput')?.focus();
  }

  onSearchTextClearButtonClick() {
    this.inputSearchText = '';
    this.onTextSearchButtonClick();
  }

  onSortButtonClick() {
    // Copy sort settings.
    this.sortSettingCopy = { ...this.sortSetting };

    this.showSortDialog = true;
  }

  async onSortSettingsDialogResult(canceled: boolean) {
    const location = `${this.className}.onSortSettingsDialogResult()`;

    // Close dialog.
    this.showSortDialog = false;

    // Restore original setting if canceled.
    if (canceled) {
      this.sortSetting = { ...this.sortSettingCopy };
      this.logger.trace(location, { filter: this.sortSetting });
      return;
    }
    this.logger.trace(location, { filter: this.sortSetting });

    // Show spinner.
    this.spinner.show();

    // Sort characters and filtered index list.
    this.filteredIndexes = this.characterFilter.sort(this.characters, this.sortSetting);

    // Update paginate info.
    this.paginator.goToFirstPage();

    // Update thumbnail images.
    await this.updateCharacterListPage();

    // Hide spinner.
    this.spinner.hide();
  }

  onSortSettingsOkButtonClick() {
    this.sortSettingsForm.onOkClick();
  }

  onSortSettingsCancelButtonClick() {
    this.sortSettingsForm.onCancelClick();
  }

  //============================================================================
  // Private methods.
  //
  //----------------------------------------------------------------------------
  // Re-draw page.
  //
  private async updateCharacterListPage(): Promise<void> {
    await this.loadThumbImages();
    this.updateThumbImages();
    this.makeCharacterInfoTables();
    this.updateOwnershipStatuses();
  }

  //----------------------------------------------------------------------------
  // Filtering and sorting data control.
  //
  // private getFilterItemCount(settings);

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
    const cType = this.firestore.getDataById(FsCollectionName.CharacterTypes, character.type) as FsCharacterType;

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
    this.makeBasicInfoCellValue(td, character);
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
    this.makeCharacterTagLinks(td, character.tags);
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

  private makeBasicInfoCellValue(td: HTMLTableCellElement, character: FsCharacter) {
    let result = '';

    // Get character type.
    const characterType = this.firestore.getDataById(FsCollectionName.CharacterTypes, character.type) as FsCharacterType;

    // Weapon type.
    if (character.weaponType !== '') {
      let tmp = '武器タイプ: ';
      let wt = this.firestore.getDataById(FsCollectionName.WeaponTypes, character.weaponType) as FsWeaponType;
      tmp += wt ? wt.name : 'n.a.';
      result += tmp;
    }

    // Geograph types.
    if (character.geographTypes.length > 0) {
      let tmp = ', 地形タイプ: ';
      for (let i = 0; i < character.geographTypes.length; ++i) {
        let gt = this.firestore.getDataById(FsCollectionName.GeographTypes, character.geographTypes[i]) as FsGeographType;
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
      let rg = this.firestore.getDataById(FsCollectionName.Regions, character.region) as FsRegion;
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

    // Make normal text node.
    HtmlElementUtil.appendTextNode(td, result);

    // CV.
    if (character.voiceActors.length > 0) {
      let tmp = `, CV: `;
      if (character.voiceActors.length >= 2) {
        tmp += '[';
      }
      HtmlElementUtil.appendTextNode(td, tmp);
      for (let i = 0; i < character.voiceActors.length; ++i) {
        if (i > 0) {
          HtmlElementUtil.appendTextNode(td, ',');
        }
        const cv = this.firestore.getDataById(FsCollectionName.VoiceActors, character.voiceActors[i]);
        if (cv) {
          HtmlElementUtil.appendTextAnchor(td, cv.name, `main/list-character/text&${cv.name}`);
        }
      }
      if (character.voiceActors.length >= 2) {
        HtmlElementUtil.appendTextNode(td, ']');
      }
    }

    // Illustrator.
    if (character.illustrators.length > 0) {
      let tmp = `, イラスト: `;
      if (character.illustrators.length >= 2) {
        tmp += '[';
      }
      HtmlElementUtil.appendTextNode(td, tmp);
      for (let i = 0; i < character.illustrators.length; ++i) {
        if (i > 0) {
          HtmlElementUtil.appendTextNode(td, ',');
        }
        const illustrator = this.firestore.getDataById(FsCollectionName.Illustrators, character.illustrators[i]);
        if (illustrator) {
          HtmlElementUtil.appendTextAnchor(td, illustrator.name, `main/list-character/text&${illustrator.name}`);
        }
      }
      if (character.illustrators.length >= 2) {
        HtmlElementUtil.appendTextNode(td, ']');
      }
    }

    if (character.implementedDate) {
      let tmp = `, 実装日: ${this.firestore.convTimestampToDate(character.implementedDate).toLocaleDateString()}`;
      HtmlElementUtil.appendTextNode(td, tmp);
    }
  }

  private makeMotifWeaponAndFacilityText(character: FsCharacter): string {
    let result = '';

    // No motif weapons and facilities.
    if (character.motifWeapons.length === 0 && character.motifFacilities.length === 0) {
      return 'n.a.';
    }

    // Motif weapons.
    if (character.motifWeapons.length > 0) {
      let tmp = '';
      for (let i = 0; i < character.motifWeapons.length; ++i) {
        const wp = this.firestore.getDataById(FsCollectionName.Weapons, character.motifWeapons[i]) as FsWeapon;
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
      // Collect facility information.
      let motifFacilities: { facility: FsFacility; type: FsFacilityType }[] = [];
      for (let i = 0; i < character.motifFacilities.length; ++i) {
        const facility = this.firestore.getDataById(FsCollectionName.Facilities, character.motifFacilities[i]) as FsFacility;
        const facilityType = this.firestore.getDataById(FsCollectionName.FacilityTypes, facility.type) as FsFacilityType;
        motifFacilities.push({ facility: facility, type: facilityType });
      }

      // Sort motif facilities by facility type.
      motifFacilities.sort((a, b) => {
        return a.type.code < b.type.code ? -1 : 1;
      });

      // Make facility info text.
      let tmp = '';
      for (let i = 0; i < motifFacilities.length; ++i) {
        if (i > 0 || result.length > 0) {
          tmp += ', ';
        }
        tmp += `${motifFacilities[i].facility.name}(${motifFacilities[i].type.name})`;
      }
      result += tmp;
    }

    return result;
  }

  private makeCharacterTagText(character: FsCharacter): string {
    let result = '';

    // CASE: No character tags.
    if (character.tags.length === 0) {
      return 'n.a.';
    }

    // CASE: Make character tag text.
    else {
      for (let i = 0; i < character.tags.length; ++i) {
        const tag = this.firestore.getDataById(FsCollectionName.CharacterTags, character.tags[i]) as FsCharacterTag;
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

  private makeCharacterTagLinks(td: HTMLTableCellElement, ids: string[]) {
    if (ids.length === 0) {
      td.textContent = 'n.a.';
      return;
    }

    for (let i = 0; i < ids.length; ++i) {
      if (i > 0) {
        td.appendChild(document.createTextNode(', '));
      }

      const tagName = this.firestore.getDataById(FsCollectionName.CharacterTags, ids[i]).name;
      HtmlElementUtil.appendTextAnchor(td, tagName, `main/list-character/tag&${tagName}`);
    }
  }

  private makeAbilityInfoRows(t: HTMLTableElement, character: FsCharacter, type: FsAbilityType) {
    // Filter abilities and abilities(kai).
    // const abilities = this.abilities.filter((item) => character.abilities.includes(item.id)).filter((item) => item.type === type.id);
    // const abilitiesKai = this.abilities.filter((item) => character.abilitiesKai.includes(item.id)).filter((item) => item.type === type.id);
    const abilities = (this.firestore.getDataByIds(FsCollectionName.Abilities, character.abilities) as FsAbility[]).filter((item) => item.type === type.id);
    const abilitiesKai = (this.firestore.getDataByIds(FsCollectionName.Abilities, character.abilitiesKai) as FsAbility[]).filter(
      (item) => item.type === type.id
    );

    // 2022-10-09: Show abilities by order in character ability list.
    // // Sort ability list by updated date.
    // this.firestore.sortByTimestamp(abilities, 'updatedAt');
    // this.firestore.sortByTimestamp(abilitiesKai, 'updatedAt');

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
        if (type.isKeiryaku && ability.interval >= 0) {
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
        if (type.isKeiryaku && ability.interval >= 0) {
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

    // Calc image size and gaps.
    let iw = mobileMode ? 80 : 105;
    let ih = iw;
    let gw = mobileMode ? 6 : 12;
    let gh = gw;

    // Calc number of images.
    let columnNum = 0;
    let rowNum = 0;
    if (mobileMode) {
      columnNum = Math.floor(dw / (iw + gw));
      rowNum = Math.floor(dh / (ih + gh));
    } else {
      columnNum = Math.floor((dw - iw) / (iw + gw)) + 1;
      rowNum = Math.floor((dh - ih) / (ih + gh)) + 1;
    }

    // columns x rows = total image count.
    result = columnNum * rowNum;
    this.logger.debug(location, {
      dw: dw,
      dh: dh,
      mobileMode: mobileMode,
      columnNum: columnNum,
      rowNum: rowNum,
      result: result,
    });

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
  // User data.
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
      filterSetting: this.filterSetting,
      inputSearchText: this.inputSearchText,
      sortSetting: this.sortSetting,
    };
  }

  private restorePageParameter() {
    this.paginator = this.navigator.paramStorage['list-character'].paginator;
    this.isListLayout = this.navigator.paramStorage['list-character'].isListLayout;
    this.filterSetting = this.navigator.paramStorage['list-character'].filterSetting;
    this.inputSearchText = this.navigator.paramStorage['list-character'].inputSearchText;
    this.sortSetting = this.navigator.paramStorage['list-character'].sortSetting;
    this.filteredIndexes = this.characterFilter.filter(this.characters, this.filterSetting, this.inputSearchText);
    this.filteredIndexes = this.characterFilter.sort(this.characters, this.sortSetting);

    // Clear parameter storage after restore them once.
    this.clearPageParameter();
  }

  private clearPageParameter() {
    this.navigator.paramStorage['list-character'] = undefined;
  }
}
