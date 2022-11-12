import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { ConfirmationService } from 'primeng/api';
import { FsCollectionName } from 'src/app/services/firestore-data/firestore-collection-name.enum';
import { FirestoreDataService } from 'src/app/services/firestore-data/firestore-data.service';
import { AbilityAttrType, FsCharacterRarerityMax, FsGeographType, FsRegion, FsWeaponType } from 'src/app/services/firestore-data/firestore-document.interface';
import { UserAuthService } from '../../services/user-auth/user-auth.service';
import { isMobileMode } from '../../utils/window-size/window-size.util';
import {
  CharacterFilterOptionAbilityAttrLabels,
  CharacterFilterOptionAbilityTypeLabels,
  CharacterFilterOptionOthersType,
  CharacterFilterOptionTokenTypeLabels,
  CharacterFilterSetting,
  CharacterOwnershipFilterType,
  CharacterOwnershipFilterTypeLabels,
  CharacterTypeFilterTypeLabels,
} from './character-filter-settings-form.interface';

@Component({
  selector: 'app-character-filter-settings-form',
  templateUrl: './character-filter-settings-form.component.html',
  styleUrls: ['./character-filter-settings-form.component.scss'],
})
export class CharacterFilterSettingsFormComponent {
  private readonly className = 'CharacterFilterSettingsFormComponent';

  /** Appearance. */
  @Input() buttonStyleClass = '';

  @Input() hideButton = false;

  /** Form result. */
  @Input() filterSetting!: CharacterFilterSetting;

  @Output() filterSettingChange = new EventEmitter<CharacterFilterSetting>();

  /** User character ownership status type. */
  readonly ownershipStatusTypeItems = CharacterOwnershipFilterTypeLabels;

  /** Character type. */
  readonly characterTypeItems = CharacterTypeFilterTypeLabels;

  /** Rarerity */
  rarerityItems: number[];

  /** Weapon types. */
  weaponTypeItems: FsWeaponType[] = this.firestore.getData(FsCollectionName.WeaponTypes) as FsWeaponType[];

  /** Geograph types. */
  geographTypeItems: FsGeographType[] = this.firestore.getData(FsCollectionName.GeographTypes) as FsGeographType[];

  /** Regions. */
  regionItems: FsRegion[] = this.firestore.getData(FsCollectionName.Regions) as FsRegion[];

  /** Token type. */
  abilityTypeItems = CharacterFilterOptionAbilityTypeLabels;

  abilityAttrItems = CharacterFilterOptionAbilityAttrLabels;

  tokenTypeItems = CharacterFilterOptionTokenTypeLabels;

  selectedAbilityTypeOptions: CharacterFilterOptionOthersType[] = [];

  selectedAbilityAttrOptions: AbilityAttrType[] = [];

  selectedTokenTypeOptions: CharacterFilterOptionOthersType[] = [];

  /** Implemented date. */
  isMobile = isMobileMode();

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

  // ngOnInit(): void {}

  onOwnershipStatusTypeClick(value: string) {
    const location = `${this.className}.onOwnershipStatusTypeClick()`;
    this.logger.trace(location);

    // Show warning message if user does not signed in.
    if ((value as CharacterOwnershipFilterType) !== 'all') {
      if (!this.userAuth.signedIn) {
        this.showWarningDialogForAnnonymousUser();
      }
    }
  }

  onOkClick() {
    const location = `${this.className}.onOkClick()`;
    this.logger.trace(location);
    this.applySelectedOtherOptions(this.filterSetting);
    this.filterSettingChange.emit(this.filterSetting);
    this.canceled.emit(false);
  }

  onClearClick() {
    const location = `${this.className}.onClearClick()`;
    this.logger.trace(location);
    this.clearSettings();
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
  // Split other options selection.
  //
  private applySelectedOtherOptions(filter: CharacterFilterSetting) {
    // Clear option flags.
    filter.ownershipAbility = false;
    filter.teamAbility = false;
    filter.defeatedTimeAbility = false;
    filter.tokenTypes = [];

    // Check ability type options.
    for (let i = 0; i < this.selectedAbilityTypeOptions.length; ++i) {
      const item = this.selectedAbilityTypeOptions[i];

      if (item === 'ownershipAbility') {
        filter.ownershipAbility = true;
      } else if (item === 'teamAbility') {
        filter.teamAbility = true;
      } else if (item === 'defeatedTimeAbility') {
        filter.defeatedTimeAbility = true;
      }
    }

    // Check token type options.
    for (let i = 0; i < this.selectedTokenTypeOptions.length; ++i) {
      const item = this.selectedTokenTypeOptions[i];

      if (item === 'tokenRed') {
        filter.tokenTypes.push('赤');
      } else if (item === 'tokenBlue') {
        filter.tokenTypes.push('青');
      } else if (item === 'tokenRedAndBlue') {
        filter.tokenTypes.push('赤青');
      } else if (item === 'tokenWater') {
        filter.tokenTypes.push('水上');
      }
    }

    // Check ability attribute type options.
    filter.abilityAttributes = this.selectedAbilityAttrOptions;
  }

  //----------------------------------------------------------------------------
  // Confirmation dialog.
  //
  private showWarningDialogForAnnonymousUser() {
    this.confirmationDialog.confirm({
      message: 'キャラクター所持状況を管理するためにはログインが必要です。',
      acceptLabel: 'OK',
      rejectVisible: false,
      accept: () => {
        this.filterSetting.ownershipFilterType = 'all';
      },
      reject: () => {
        this.filterSetting.ownershipFilterType = 'all';
      },
    });
  }

  //----------------------------------------------------------------------------
  // Others.
  //
  private clearSettings() {
    this.filterSetting = new CharacterFilterSetting();
    this.selectedAbilityTypeOptions = [];
    this.selectedAbilityAttrOptions = [];
    this.selectedTokenTypeOptions = [];
  }
}
