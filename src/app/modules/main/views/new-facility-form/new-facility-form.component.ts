import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { FsCollectionName } from 'src/app/services/firestore-data/firestore-collection-name.enum';
import { FirestoreDataService } from 'src/app/services/firestore-data/firestore-data.service';
import { FsFacilityRarerityMax, FsFacilityType } from 'src/app/services/firestore-data/firestore-document.interface';
import { NewFacilityFormData, NewFacilityFormMode } from './new-facility-form.interafce';

@Component({
  selector: 'app-new-facility-form',
  templateUrl: './new-facility-form.component.html',
  styleUrls: ['./new-facility-form.component.scss'],
})
export class NewFacilityFormComponent implements OnInit {
  //============================================================================
  // Class members.
  //
  private readonly className = 'NewFacilityFormComponent';

  /** Appearance. */
  @Input() mode: NewFacilityFormMode = 'normal';

  @Input() styleClass = '';

  @Input() okLabel = 'Ok';

  @Input() cancelLabel = 'Cancel';

  @Input() buttonStyleClass = '';

  /** Form data. */
  @Input() facilityData!: NewFacilityFormData;

  @Output() facilityDataChange = new EventEmitter<NewFacilityFormData>();

  @Output() canceled = new EventEmitter<boolean>();

  /** Facility type */
  facilityTypeItems = this.firestore.getData(FsCollectionName.FacilityTypes) as FsFacilityType[];

  /** Facility Rarerity */
  rarerityItems: number[] = [];

  selectedRarerity?: number;

  /** Facility description */
  inputDescriptions: string[] = [''];

  /** Facility effects */
  inputEffects: string[] = [];

  /** Facility details */
  inputDetails: string[] = ['', '', ''];

  /** Error message */
  errorMessage = '';

  //============================================================================
  // Class methods.
  //
  constructor(private logger: NGXLogger, private firestore: FirestoreDataService) {
    this.logger.trace(`new ${this.className}()`);

    // Initialize rarerity list.
    for (let i = 0; i < FsFacilityRarerityMax; ++i) {
      this.rarerityItems.push(i + 1);
    }
  }

  ngOnInit(): void {
    const location = `${this.className}.ngOnInit()`;
    this.logger.trace(location);

    // Copy description texts.
    for (let i = 0; i < this.facilityData.descriptions.length; ++i) {
      this.inputDescriptions[i] = this.facilityData.descriptions[i].slice();
    }
    for (let i = 0; i < this.facilityData.effects.length; ++i) {
      this.inputEffects[i] = this.facilityData.effects[i].slice();
    }
    for (let i = 0; i < this.facilityData.details.length; ++i) {
      this.inputDetails[i] = this.facilityData.details[i].slice();
    }

    // Sort facility types.
    this.firestore.sortByCode(this.facilityTypeItems);
  }

  onNameInputChange() {
    const location = `${this.className}.onNameInputChange()`;
    this.logger.trace(location);

    const facilities = this.firestore.getData(FsCollectionName.Facilities);
    for (let facility of facilities) {
      if (facility.name === this.facilityData.name) {
        this.logger.warn(location, 'Existing facility name.', { name: this.facilityData.name });
        this.errorMessage = '既に登録済の名前です。';
        return;
      }
    }

    this.errorMessage = '';
  }

  /**
   * Track function which is used by *ngFor directive.
   * *ngFor cannot calculate index number when it's used with [(ngModel)].
   * So, this function help *ngFor to calculate index.
   * @param index Item index.
   * @param obj List object. Not used.
   * @returns Item index.
   */
  trackByItem(index: number, obj: any): any { // eslint-disable-line
    return index;
  }

  onOkClick() {
    const location = `${this.className}.onOkClick()`;
    this.logger.trace(location);

    this.makeFacilityData();
    this.facilityDataChange.emit(this.facilityData);
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
  private makeFacilityData() {
    // Copy description texts.
    this.facilityData.descriptions = this.inputDescriptions.filter((text) => text.length > 0);
    this.facilityData.effects = this.inputEffects.filter((text) => text.length > 0);
    this.facilityData.details = this.inputDetails.filter((text) => text.length > 0);
  }
}
