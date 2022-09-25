import { Component, OnInit, ViewChild } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { FsCollectionName } from 'src/app/services/firestore-data/firestore-collection-name.enum';
import { FirestoreDataService } from 'src/app/services/firestore-data/firestore-data.service';
import {
  FsCharacter,
  FsGeographType,
  FsWeaponType,
} from 'src/app/services/firestore-data/firestore-document.interface';
import { CharacterFilterService } from '../../services/character-filter/character-filter.service';
import { SpinnerService } from '../../services/spinner/spinner.service';
import { UserAuthService } from '../../services/user-auth/user-auth.service';
import { PaginatorControl } from '../../utils/paginator-control/paginator-control.class';
import { CharacterFilterSettingsFormComponent } from '../../views/character-filter-settings-form/character-filter-settings-form.component';
import { CharacterFilterSettings } from '../../views/character-filter-settings-form/character-filter-settings-form.interface';
import { CharacterSortSettingsFormComponent } from '../../views/character-sort-settings-form/character-sort-settings-form.component';
import { CharacterSortSettings } from '../../views/character-sort-settings-form/character-sort-settings-form.interface';

@Component({
  selector: 'app-list-character-ownership',
  templateUrl: './list-character-ownership.component.html',
  styleUrls: ['./list-character-ownership.component.scss'],
})
export class ListCharacterOwnershipComponent implements OnInit {
  private readonly className = 'ListCharacterOwnershipComponent';

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

  inputCharacterOwnershipStatuses: number[] = [];

  characterLabels: string[] = Array(this.maxRowNum);

  /** Filter dialog. */
  filterDialogShown = false;

  filterSettings = new CharacterFilterSettings();

  filterSettingsCopy = new CharacterFilterSettings();

  /** Sort dialog. */
  sortDialogShown = false;

  sortSettings = new CharacterSortSettings();

  sortSettingsCopy = new CharacterSortSettings();

  //============================================================================
  // Class methods.
  //
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

    // Initalize filter service.
    this.filteredIndexes = this.characterFilter.filter(this.characters, this.filterSettings, '');

    // Initialize character label array.
    this.updateCharacterLabels();

    // Set up paginator control info.
    this.paginator.rowNum = this.maxRowNum;
    this.paginator.goToFirstPage();

    // Update each checkbox status.
    this.updateOwnershipStatuses();
  }

  ngOnInit(): void {}

  onFilterButtonClick() {
    this.filterSettingsCopy = { ...this.filterSettings };
    this.filterDialogShown = true;
  }

  onFilterSettingsDialogResult(canceled: boolean) {
    const location = `${this.className}.onFilterSettingsDialogResult()`;

    // Close dialog.
    this.filterDialogShown = false;

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

    // Update character label texts and checkbox statuses.
    this.updateCharacterLabels();
    this.updateOwnershipStatuses();

    // Hide spinner.
    this.spinner.hide();
  }

  onSortButtonClick() {
    this.sortSettingsCopy = { ...this.sortSettings };
    this.sortDialogShown = true;
  }

  onSortSettingsDialogResult(canceled: boolean) {
    const location = `${this.className}.onSortSettingsDialogResult()`;

    // Close dialog.
    this.sortDialogShown = false;

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

    // Update character label texts and checkbox statuses.
    this.updateCharacterLabels();
    this.updateOwnershipStatuses();

    // Hide spinner.
    this.spinner.hide();
  }

  onFilterSettingsOkButtonClick() {
    this.filterSettingsForm.onOkClick();
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
    document.getElementById('ListCharacterOwnership_SearchTextInput')?.focus();
  }

  async onApplyButtonClick() {
    const location = `${this.className}.onApplyButtonClick()`;
    this.logger.trace(location);

    this.spinner.show();

    // Update user data.
    this.updateUserData();

    // Upload updated user data.
    await this.firestore.updateField(
      FsCollectionName.Users,
      this.userAuth.userData.id,
      'characters',
      this.userAuth.userData.characters
    );

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
      // Add all row indexes to inputCharacterOwnershipStatuses.
      this.inputCharacterOwnershipStatuses = [];
      for (let i = 0; i < this.paginator.rowNum; ++i) {
        this.inputCharacterOwnershipStatuses.push(i);
      }
    }

    // CASE: Unchecked.
    else {
      // Clear checkbox input values.
      this.inputCharacterOwnershipStatuses = [];
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
      this.updateOwnershipStatuses();

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
  // Character ownership status.
  //
  /**
   * It updates 'this.inputCharacterOwnershipStatuses'.
   * Filtering, sorting, and paginator information shall be updated beforehand.
   */
  private updateOwnershipStatuses() {
    // Clear checkboxes.
    this.inputCharacterOwnershipStatuses = [];

    // Scan paginator rows.
    for (let i = 0; i < this.paginator.rowNum; ++i) {
      // Stop process if it reaches the end of filtered indexes.
      if (i + this.paginator.firstItemIndex >= this.filteredIndexes.length) {
        break;
      }

      // Get character ID.
      const characterId = this.characters[this.filteredIndexes[i + this.paginator.firstItemIndex]].id;

      // Check if the user has that character.
      if (this.userAuth.userData.characters.includes(characterId)) {
        this.inputCharacterOwnershipStatuses.push(i);
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
    const userData = this.userAuth.userData.characters;

    for (let i = 0; i < this.paginator.rowNum; ++i) {
      if (i + this.paginator.firstItemIndex >= this.filteredIndexes.length) {
        break;
      }

      // Get checkbox status and character ID.
      const checked = this.inputCharacterOwnershipStatuses.includes(i);
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
    document.getElementById('ListCharacterOwnership_Content')?.scrollTo({ top: 0, behavior: 'auto' });
  }
}
