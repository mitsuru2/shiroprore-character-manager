import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { ConfirmationService } from 'primeng/api';
import { FsCollectionName } from 'src/app/services/firestore-data/firestore-collection-name.enum';
import { FirestoreDataService } from 'src/app/services/firestore-data/firestore-data.service';
import {
  FsCharacterRarerityMax,
  FsGeographType,
  FsRegion,
  FsWeaponType,
} from 'src/app/services/firestore-data/firestore-document.interface';
import { UserAuthService } from '../../services/user-auth/user-auth.service';
import {
  CharacterFilterSettings,
  CharacterOwnershipStatusType,
  CharacterOwnershipStatusTypes,
} from './character-filter-settings-form.interface';

@Component({
  selector: 'app-character-filter-settings-form',
  templateUrl: './character-filter-settings-form.component.html',
  styleUrls: ['./character-filter-settings-form.component.scss'],
})
export class CharacterFilterSettingsFormComponent implements OnInit {
  private readonly className = 'CharacterFilterSettingsFormComponent';

  /** Appearance. */
  @Input() buttonStyleClass = '';

  /** Form result. */
  @Input() filterSettings!: CharacterFilterSettings;

  @Output() filterSettingsChange = new EventEmitter<CharacterFilterSettings>();

  /** User character ownership status type. */
  readonly ownershipStatusTypeItems = CharacterOwnershipStatusTypes;

  /** Rarerity */
  rarerityItems: number[];

  /** Weapon types. */
  weaponTypeItems: FsWeaponType[] = this.firestore.getData(FsCollectionName.WeaponTypes) as FsWeaponType[];

  /** Geograph types. */
  geographTypeItems: FsGeographType[] = this.firestore.getData(FsCollectionName.GeographTypes) as FsGeographType[];

  /** Regions. */
  regionItems: FsRegion[] = this.firestore.getData(FsCollectionName.Regions) as FsRegion[];

  /** Button event. */
  @Output() canceled = new EventEmitter<boolean>();

  //============================================================================
  // Class methods.
  //
  constructor(
    private logger: NGXLogger,
    private firestore: FirestoreDataService,
    private userAuth: UserAuthService,
    private confirmationDialog: ConfirmationService
  ) {
    const location = `new ${this.className}()`;
    this.logger.trace(location);

    // Init rarerrity items.
    this.rarerityItems = [];
    for (let i = 0; i < FsCharacterRarerityMax; ++i) {
      this.rarerityItems.push(i + 1);
    }
  }

  ngOnInit(): void {}

  onOwnershipStatusTypeClick(value: string) {
    const location = `${this.className}.onOwnershipStatusTypeClick()`;
    this.logger.trace(location);

    // Show warning message if user does not signed in.
    if (value !== CharacterOwnershipStatusType.All) {
      if (!this.userAuth.signedIn) {
        this.showWarningDialogForAnnonymousUser();
      }
    }
  }

  onOkClick() {
    const location = `${this.className}.onOkClick()`;
    this.logger.trace(location);
    this.filterSettingsChange.emit(this.filterSettings);
    this.canceled.emit(false);
  }

  onCancelClick() {
    const location = `${this.className}.onCancelClick()`;
    this.logger.trace(location);
    this.canceled.emit(true);
  }

  //============================================================================
  // Private methods.
  //
  //----------------------------------------------------------------------------
  // Confirmation dialog.
  //
  private showWarningDialogForAnnonymousUser() {
    this.confirmationDialog.confirm({
      message: '???????????????????????????????????????????????????????????????????????????????????????',
      acceptLabel: '??????',
      rejectVisible: false,
      accept: () => {
        this.filterSettings.ownershipStatusType = CharacterOwnershipStatusType.All;
      },
      reject: () => {
        this.filterSettings.ownershipStatusType = CharacterOwnershipStatusType.All;
      },
    });
  }
}
