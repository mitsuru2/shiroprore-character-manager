import { Component, OnInit } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { FsCollectionName } from 'src/app/services/firestore-data/firestore-collection-name.enum';
import { FirestoreDataService } from 'src/app/services/firestore-data/firestore-data.service';
import { FsCharacter } from 'src/app/services/firestore-data/firestore-document.interface';
import { SpinnerService } from '../../services/spinner/spinner.service';
import { UserAuthService } from '../../services/user-auth/user-auth.service';
import { PaginatorControl } from '../../utils/paginator-control/paginator-control.class';

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

  /** Data view: contents. */
  filteredIndexes: number[] = [];

  /** Paginator */
  paginator = new PaginatorControl();

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

  onFilterButtonClick() {}

  onSortButtonClick() {}

  onSearchTextClearButtonClick() {}

  onTextSearchButtonClick() {}

  onPageChange(event: any) {}

  //============================================================================
  //
  //
}
