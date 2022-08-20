import { Component, OnInit } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { FsCollectionName } from 'src/app/services/firestore-data/firestore-collection-name.enum';
import { FirestoreDataService } from 'src/app/services/firestore-data/firestore-data.service';
import { FsCharacter } from 'src/app/services/firestore-data/firestore-document.interface';
import { SpinnerService } from '../../services/spinner/spinner.service';
import { UserAuthService } from '../../services/user-auth/user-auth.service';
import { PaginatorControl } from '../../utils/paginator-control/paginator-control.class';
import { CharacterFilterSettings } from '../../views/character-filter-settings-form/character-filter-settings-form.interface';
import { CharacterSortSettings } from '../../views/character-sort-settings-form/character-sort-settings-form.interface';

@Component({
  selector: 'app-list-character-ownership',
  templateUrl: './list-character-ownership.component.html',
  styleUrls: ['./list-character-ownership.component.scss'],
})
export class ListCharacterOwnershipComponent implements OnInit {
  private readonly className = 'ListCharacterOwnershipComponent';

  /** Firestore data. */
  characters = this.firestore.getData(FsCollectionName.Characters) as FsCharacter[];

  /** Text search input. */
  inputSearchText: string = '';

  /** Apply button. */
  changed = false;

  /** Data view: contents. */
  filteredIndexes: number[] = [];

  checkboxAll: boolean[] = [];

  checkboxInputs: number[] = [];

  /** Paginator */
  paginator = new PaginatorControl();

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
    private spinner: SpinnerService
  ) {
    this.logger.trace(`new ${this.className}()`);

    // Sort character data.
    this.characters.sort((a, b) => {
      return a.index < b.index ? -1 : 1;
    });

    // Initalize filtered index array.
    for (let i = 0; i < this.characters.length; ++i) {
      this.filteredIndexes.push(i);
    }

    // Set up paginator control info.
    this.paginator.rowNum = 100;
    this.paginator.goToFirstPage();
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

    // Update paginate info.

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

    // Update paginate info.

    // Hide spinner.
    this.spinner.hide();
  }

  onSearchTextClearButtonClick() {}

  onTextSearchButtonClick() {}

  onApplyButtonClick() {}

  onPageChange(event: any) {
    const location = `${this.className}.onPageChange()`;
    this.logger.trace(location, event);

    if (this.paginator.pageIndex !== event.page) {
      // Update paginate info.
      this.paginator.firstItemIndex = event.first;
      this.paginator.pageIndex = event.page;

      // Scroll.
      this.scrollToTop();
    }
  }

  //============================================================================
  // Private methods.
  //
  //----------------------------------------------------------------------------
  // Other utilities.
  //
  private scrollToTop() {
    this.logger.trace('scrollToTop()');
    document.getElementById('ListCharacterOwnership_Content')?.scrollTo({ top: 0, behavior: 'auto' });
  }
}
