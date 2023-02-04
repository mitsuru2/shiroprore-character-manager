import { Component, ViewChild /*OnInit*/ } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { FsCollectionName } from 'src/app/services/firestore-data/firestore-collection-name.enum';
import { FirestoreDataService } from 'src/app/services/firestore-data/firestore-data.service';
import { FsCharacter, FsCharacterType, FsGeographType, FsWeaponType } from 'src/app/services/firestore-data/firestore-document.interface';
import { CharacterFilterService } from '../../services/character-filter/character-filter.service';
import { SpinnerService } from '../../services/spinner/spinner.service';
import { UserAuthService } from '../../services/user-auth/user-auth.service';
import { PaginatorControl } from '../../utils/paginator-control/paginator-control.class';
import { CharacterFilterSettingsFormComponent } from '../../views/character-filter-settings-form/character-filter-settings-form.component';
import { CharacterFilterSetting } from '../../views/character-filter-settings-form/character-filter-settings-form.interface';
import { CharacterSortSettingsFormComponent } from '../../views/character-sort-settings-form/character-sort-settings-form.component';
import { CharacterSortSetting } from '../../views/character-sort-settings-form/character-sort-settings-form.interface';

@Component({
  selector: 'app-list-character-kaichiku',
  templateUrl: './list-character-kaichiku.component.html',
  styleUrls: ['./list-character-kaichiku.component.scss'],
})
export class ListCharacterKaichikuComponent /*implements OnInit*/ {
  private readonly className = 'ListCharacterKaichikuComponent';

  /** Filter settings form. */
  @ViewChild(CharacterFilterSettingsFormComponent) private filterSettingsForm!: CharacterFilterSettingsFormComponent;

  /** Sort settings form. */
  @ViewChild(CharacterSortSettingsFormComponent) private sortSettingsForm!: CharacterSortSettingsFormComponent;

  /** Firestore data. */
  characters = this.firestore.getData(FsCollectionName.Characters) as FsCharacter[];

  /** Text search input. */
  inputSearchText: string = '';

  /** Apply button. */
  changed = false;

  /** Paginator */
  paginator = new PaginatorControl();

  private readonly maxRowNum = 100;

  /** Data view: contents. */
  filteredIndexes: number[] = [];

  inputAllCheckboxSwitch: boolean[] = [];

  inputCharacterKaichikuStatuses: number[] = [];

  characterLabels: string[] = Array(this.maxRowNum);

  /** Filter dialog. */
  filterDialogShown = false;

  filterSetting = new CharacterFilterSetting();

  filterSettingCopy = new CharacterFilterSetting();

  /** Sort dialog. */
  sortDialogShown = false;

  sortSetting = new CharacterSortSetting();

  sortSettingCopy = new CharacterSortSetting();

  constructor(
    private logger: NGXLogger,
    private firestore: FirestoreDataService,
    private userAuth: UserAuthService,
    private spinner: SpinnerService,
    private characterFilter: CharacterFilterService
  ) {
    this.logger.trace(`new ${this.className}()`);

    // Sort character data.
    this.characters.sort((a, b) => {
      return a.index < b.index ? -1 : 1;
    });

    // Filter characters. Characters which enable kaichiku are only needed.
    const kaichikuTypes = (this.firestore.getData(FsCollectionName.CharacterTypes) as FsCharacterType[])
      .filter((item) => item.isKaichikuEnable)
      .map((item) => item.id);
    this.characters = (this.firestore.getData(FsCollectionName.Characters) as FsCharacter[]).filter((item) => kaichikuTypes.includes(item.type));
    this.logger.debug('constructor', { kaichikuTypes: kaichikuTypes, characters: this.characters });

    // Initalize filter service.
    this.filteredIndexes = this.characterFilter.filter(this.characters, this.filterSetting, '');

    // Initialize character label array.
    this.updateCharacterLabels();

    // Set up paginator control info.
    this.paginator.rowNum = this.maxRowNum;
    this.paginator.goToFirstPage();

    // Update each checkbox status.
    this.updateKaichikuStatuses();
  }

  // ngOnInit(): void {}

  onFilterButtonClick() {
    this.filterSettingCopy = { ...this.filterSetting };
    this.filterDialogShown = true;
  }

  onFilterSettingsDialogResult(canceled: boolean) {
    const location = `${this.className}.onFilterSettingsDialogResult()`;

    // Close dialog.
    this.filterDialogShown = false;

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

    // Update character label texts and checkbox statuses.
    this.updateCharacterLabels();
    this.updateKaichikuStatuses();

    // Hide spinner.
    this.spinner.hide();
  }

  onSortButtonClick() {
    this.sortSettingCopy = { ...this.sortSetting };
    this.sortDialogShown = true;
  }

  onSortSettingsDialogResult(canceled: boolean) {
    const location = `${this.className}.onSortSettingsDialogResult()`;

    // Close dialog.
    this.sortDialogShown = false;

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

    // Update character label texts and checkbox statuses.
    this.updateCharacterLabels();
    this.updateKaichikuStatuses();

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

  onSearchTextClearButtonClick() {
    this.inputSearchText = '';
    this.onTextSearchButtonClick();
  }

  onTextSearchButtonClick() {
    this.onFilterSettingsDialogResult(false);
    document.getElementById('ListCharacterKaichiku_SearchTextInput')?.focus();
  }

  async onApplyButtonClick() {
    const location = `${this.className}.onApplyButtonClick()`;
    this.logger.trace(location);

    this.spinner.show();

    // Update user data.
    this.updateUserData();

    // Upload updated user data.
    await this.firestore.updateField(FsCollectionName.Users, this.userAuth.userData.id, 'kaichikuCharacters', this.userAuth.userData.kaichikuCharacters);

    // Clear changed flag.
    this.changed = false;

    this.spinner.hide();
  }

  onAllCheckboxSwitchClick() {
    const location = `${this.className}.onAllCheckboxSwitchClick()`;
    const checked = this.inputAllCheckboxSwitch.length === 0 ? false : true;
    this.logger.trace(location, { inputAllCheckboxSwitch: checked });

    // Set changed flag.
    this.changed = true;

    // CASE: Checked.
    if (checked) {
      // Add all row indexes to inputCharacterKaichikuStatuses.
      this.inputCharacterKaichikuStatuses = [];
      for (let i = 0; i < this.paginator.rowNum; ++i) {
        this.inputCharacterKaichikuStatuses.push(i);
      }
    }

    // CASE: Unchecked.
    else {
      // Clear checkbox input values.
      this.inputCharacterKaichikuStatuses = [];
    }
  }

  onIndivisualCheckboxClick(index: number, event: any) {
    const location = `${this.className}.onIndivisualCheckboxClick()`;
    this.logger.trace(location, { i: index, value: event.checked });

    // Set changed flag.
    this.changed = true;
  }

  onPageChange(event: any) {
    const location = `${this.className}.onPageChange()`;
    this.logger.trace(location, event);

    if (this.paginator.pageIndex !== event.page) {
      // Update paginate info.
      this.paginator.firstItemIndex = event.first;
      this.paginator.pageIndex = event.page;

      // Update character label texts.
      this.updateCharacterLabels();

      // Clear checkbox.
      this.inputAllCheckboxSwitch = [];
      this.updateKaichikuStatuses();

      // Clear changed flag.
      this.changed = false;

      // Scroll.
      this.scrollToTop();
    }
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
  // Character kaichiku status.
  //
  /**
   * It updates 'this.inputCharacterKaichikuStatuses'.
   * Filtering, sorting, and paginator information shall be updated beforehand.
   */
  private updateKaichikuStatuses() {
    // Clear checkboxes.
    this.inputCharacterKaichikuStatuses = [];

    // Scan paginator rows.
    for (let i = 0; i < this.paginator.rowNum; ++i) {
      // Stop process if it reaches the end of filtered indexes.
      if (i + this.paginator.firstItemIndex >= this.filteredIndexes.length) {
        break;
      }

      // Get character ID.
      const characterId = this.characters[this.filteredIndexes[i + this.paginator.firstItemIndex]].id;

      // Check if the user has that character.
      if (this.userAuth.userData.kaichikuCharacters.includes(characterId)) {
        this.inputCharacterKaichikuStatuses.push(i);
      }
    }
  }

  //----------------------------------------------------------------------------
  // Character label.
  //
  /**
   * It updates 'this.characterLabels' based on following information:
   * - this.filteredIndexes
   * - this.paginator
   * - this.characters
   * - and firestore data.
   * Filtering and/or sorting shall be done beforehand.
   */
  private updateCharacterLabels() {
    // Clear label text array.
    this.characterLabels = this.characterLabels.fill('');

    // Weapon type ID list.
    const weaponTypes = this.firestore.getData(FsCollectionName.WeaponTypes) as FsWeaponType[];
    const weaponTypeIds = weaponTypes.map((item) => item.id);

    // Geograph type ID list.
    const geographTypes = this.firestore.getData(FsCollectionName.GeographTypes) as FsGeographType[];
    const geographTypeIds = geographTypes.map((item) => item.id);

    // Update character labels.
    for (let i = 0; i < this.characterLabels.length; ++i) {
      // Stop process if it reaches the end of filtered indexes.
      if (i + this.paginator.firstItemIndex >= this.filteredIndexes.length) {
        break;
      }

      // Get character info and weapon type info.
      const character = this.characters[this.filteredIndexes[i + this.paginator.firstItemIndex]];
      const weaponTypeName = weaponTypes[weaponTypeIds.indexOf(character.weaponType)].name;
      let geographTypeName = geographTypes[geographTypeIds.indexOf(character.geographTypes[0])].name;
      if (character.geographTypes.length > 1) {
        for (let j = 1; j < character.geographTypes.length; ++j) {
          geographTypeName += `/${geographTypes[geographTypeIds.indexOf(character.geographTypes[j])].name}`;
        }
      }

      // Make label text.
      this.characterLabels[i] = `${character.name} (★${character.rarerity}, ${weaponTypeName}, ${geographTypeName})`;
    }
  }

  //----------------------------------------------------------------------------
  // User data.
  //
  private updateUserData() {
    const userData = this.userAuth.userData.kaichikuCharacters;

    for (let i = 0; i < this.paginator.rowNum; ++i) {
      if (i + this.paginator.firstItemIndex >= this.filteredIndexes.length) {
        break;
      }

      // Get checkbox status and character ID.
      const checked = this.inputCharacterKaichikuStatuses.includes(i);
      const characterId = this.characters[this.filteredIndexes[i + this.paginator.firstItemIndex]].id;

      // Update user data.
      if (checked && !userData.includes(characterId)) {
        this.userAuth.userData.characters.push(characterId);
      } else if (!checked && userData.includes(characterId)) {
        userData.splice(userData.indexOf(characterId), 1);
      }
    }
  }

  //----------------------------------------------------------------------------
  // Other utilities.
  //
  private scrollToTop() {
    this.logger.trace('scrollToTop()');
    document.getElementById('ListCharacterKaichiku_Content')?.scrollTo({ top: 0, behavior: 'auto' });
  }
}
