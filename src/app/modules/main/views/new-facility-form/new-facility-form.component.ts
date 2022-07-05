import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import {
  FsFacility,
  FsFacilityRarerityMax,
  FsFacilityType,
} from 'src/app/services/firestore-data/firestore-document.interface';
import { NewFacilityFormContent, NewFacilityFormMode, NewFacilityFormResult } from './new-facility-form.interafce';

@Component({
  selector: 'app-new-facility-form',
  templateUrl: './new-facility-form.component.html',
  styleUrls: ['./new-facility-form.component.scss'],
})
export class NewFacilityFormComponent implements OnChanges {
  //============================================================================
  // Class members.
  //
  private className = 'NewFacilityFormComponent';

  /** Status */
  @Input() shown = false;

  /** Appearance. */
  @Input() mode = NewFacilityFormMode.normal;

  minimumMode = NewFacilityFormMode.minimum;

  normalMode = NewFacilityFormMode.normal;

  @Input() styleClass = '';

  /** Button label and style. */
  @Input() okLabel = 'Ok';

  @Input() cancelLabel = 'Cancel';

  @Input() buttonStyleClass = '';

  /** Facility type */
  @Input() facilityTypes!: FsFacilityType[];

  selectedType?: FsFacilityType;

  /** Facility name */
  @Input() initialFacilityName = '';

  inputName = '';

  @Input() facilities!: FsFacility[];

  errorMessage = '';

  /** Facility Rarerity */
  rarerityItems: number[] = [];

  selectedRarerity?: number;

  /** Facility description */
  inputDescriptions: string[] = [''];

  /** Facility effects */
  inputEffects: string[] = [];

  /** Facility details */
  inputDetails: string[] = ['', '', ''];

  /** Result weapon info. */
  @Output() formResult = new EventEmitter<NewFacilityFormResult>();

  //============================================================================
  // Class methods.
  //
  constructor(private logger: NGXLogger) {
    this.logger.trace(`new ${this.className}()`);

    // Initialize rarerity list.
    for (let i = 0; i < FsFacilityRarerityMax; ++i) {
      this.rarerityItems.push(i + 1);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Clear input values when dialog is shown.
    if (changes['shown']) {
      if (changes['shown'].currentValue === true) {
        this.clearInputs();
      }
    }

    // Set input weapon name if initial value is set by parent component.
    if (!changes['initialFacilityName'] || changes['initialFacilityName'].previousValue !== this.initialFacilityName) {
      this.inputName = this.initialFacilityName;
    }

    // Sort input weapon types.
    this.facilityTypes.sort((a, b) => {
      return a.code < b.code ? -1 : 1;
    });
  }

  onNameInputChange() {
    const location = `${this.className}.onNameInputChange()`;
    this.logger.trace(location);

    for (let facility of this.facilities) {
      if (facility.name === this.inputName) {
        this.logger.warn(location, 'Existing facility name.', { name: this.inputName });
        this.errorMessage = '既に登録済の名前です。';
        return;
      }
    }

    this.errorMessage = '';
  }

  clearNameInput() {
    const location = `${this.className}.clearInputName()`;
    this.logger.trace(location);

    this.inputName = '';
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

    this.formResult.emit(this.makeFacilityInfo(false));
  }

  onCancelClick() {
    const location = `${this.className}.onCancelClick()`;
    this.logger.trace(location);

    this.formResult.emit(this.makeFacilityInfo(true));
  }

  private clearInputs() {
    this.selectedType = undefined;
    this.inputName = '';
    this.errorMessage = '';
    this.selectedRarerity = undefined;
    this.inputDescriptions = [''];
    this.inputEffects = [];
    this.inputDetails = ['', '', ''];
  }

  private makeFacilityInfo(canceled: boolean) {
    const location = `${this.className}.makeFacilityInfo()`;
    const result: NewFacilityFormResult = new NewFacilityFormResult();

    // When the form is canceled, it returns canceled flag only.
    if (canceled) {
      result.canceled = true;
    }

    // When the form is input, it returns input weapon data.
    else {
      // The mandatory input fields must not be null or undefined.
      // Input value validation shall be implemented at template.
      if (!this.selectedType || this.inputName === '' || !this.selectedRarerity) {
        this.logger.error(location, 'Necessary field is not input.', {
          type: this.selectedType,
          name: this.inputName,
          rarerity: this.selectedRarerity,
        });
        throw Error(`${location} Necessary field is not input.`);
      }

      // Make weapon data to be returned.
      result.canceled = false;
      const content = new NewFacilityFormContent();
      content.type = this.selectedType;
      content.name = this.inputName;
      content.rarerity = this.selectedRarerity;
      content.descriptions = this.inputDescriptions.filter((text) => text.length > 0);
      content.effects = this.inputEffects.filter((text) => text.length > 0);
      content.details = this.inputDetails.filter((text) => text.length > 0);
      result.content = content;
    }

    return result;
  }
}
