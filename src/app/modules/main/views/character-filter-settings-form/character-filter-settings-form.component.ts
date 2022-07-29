import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { FsCollectionName } from 'src/app/services/firestore-data/firestore-collection-name.enum';
import { FirestoreDataService } from 'src/app/services/firestore-data/firestore-data.service';
import {
  FsCharacterRarerityMax,
  FsGeographType,
  FsRegion,
  FsWeaponType,
} from 'src/app/services/firestore-data/firestore-document.interface';
import { CharacterFilterSettings, CharacterOwnershipStatusTypes } from './character-filter-settings-form.interface';

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

  //============================================================================
  // Class methods.
  //
  constructor(private logger: NGXLogger, private firestore: FirestoreDataService) {
    const location = `new ${this.className}()`;
    this.logger.trace(location);

    // Init rarerrity items.
    this.rarerityItems = [];
    for (let i = 0; i < FsCharacterRarerityMax; ++i) {
      this.rarerityItems.push(i + 1);
    }
  }

  ngOnInit(): void {}

  onOkClick() {
    const location = `${this.className}.onOkClick()`;
    this.logger.trace(location, { filter: this.filterSettings });
  }

  onCancelClick() {
    const location = `${this.className}.onCancelClick()`;
    this.logger.trace(location);
  }
}
