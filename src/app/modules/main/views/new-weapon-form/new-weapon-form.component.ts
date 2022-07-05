import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import {
  FsWeapon,
  FsWeaponRarerityMax,
  FsWeaponType,
} from 'src/app/services/firestore-data/firestore-document.interface';
import { NewWeaponFormContent, NewWeaponFormMode, NewWeaponFormResult } from './new-weapon-form.interface';

@Component({
  selector: 'app-new-weapon-form',
  templateUrl: './new-weapon-form.component.html',
  styleUrls: ['./new-weapon-form.component.scss'],
})
export class NewWeaponFormComponent implements OnChanges {
  //============================================================================
  // Class members.
  //
  private className = 'NewWeaponFormComponent';

  /** Lifecycle. */
  @Input() shown = false;

  /** Appearance. */
  @Input() mode: NewWeaponFormMode = NewWeaponFormMode.normal;

  minimumMode = NewWeaponFormMode.minimum;

  normalMode = NewWeaponFormMode.normal;

  @Input() styleClass = '';

  /** Button label and style. */
  @Input() okLabel = 'Ok';

  @Input() cancelLabel = 'Cancel';

  @Input() buttonStyleClass = '';

  /** Weapon type */
  @Input() weaponTypes!: FsWeaponType[];

  selectedType?: FsWeaponType;

  /** Weapon name */
  @Input() initialWeaponName = '';

  inputName = '';

  @Input() weapons!: FsWeapon[];

  errorMessage = '';

  /** Rarerity */
  rarerityItems: number[] = [];

  selectedRarerity?: number;

  /** Attack */
  inputAttack = 0;

  inputAttackKai = 0;

  /** Description */
  inputDescriptions: string[] = [''];

  /** Effect */
  inputEffects: string[] = ['', '', ''];

  inputEffectsKai: string[] = ['', '', ''];

  /** Result weapon info. */
  @Output() formResult = new EventEmitter<NewWeaponFormResult>();

  //============================================================================
  // Class methods.
  //
  constructor(private logger: NGXLogger) {
    this.logger.trace(`new ${this.className}()`);

    // Initialize rarerity list.
    for (let i = 0; i < FsWeaponRarerityMax; ++i) {
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

    if (!changes['initialWeaponName'] || changes['initialWeaponName'].previousValue !== this.initialWeaponName) {
      // Set input weapon name if initial value is set by parent component.
      this.inputName = this.initialWeaponName;
    }

    // Sort input weapon types.
    this.weaponTypes.sort((a, b) => {
      return a.code < b.code ? -1 : 1;
    });
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

  onNameInputChange() {
    const location = `${this.className}.onNameInputChange()`;
    this.logger.trace(location);

    for (let weapon of this.weapons) {
      if (weapon.name === this.inputName) {
        this.logger.warn(location, 'Existing weapon name.', { name: this.inputName });
        this.errorMessage = '既に登録済の名前です。';
        return;
      }
    }

    this.errorMessage = '';
  }

  clearNameInput() {
    const location = `${this.className}.clearNameInput()`;
    this.logger.trace(location);

    this.inputName = '';
    this.errorMessage = '';
  }

  onOkClick() {
    this.formResult.emit(this.makeWeaponInfo(false));
  }

  onCancelClick() {
    this.formResult.emit(this.makeWeaponInfo(true));
  }

  //============================================================================
  // Private methods.
  //
  private clearInputs() {
    this.selectedType = undefined;
    this.inputName = '';
    this.errorMessage = '';
    this.selectedRarerity = undefined;
    this.inputAttack = 0;
    this.inputAttackKai = 0;
    this.inputDescriptions = [''];
    this.inputEffects = ['', '', ''];
    this.inputEffectsKai = ['', '', ''];
  }

  private makeWeaponInfo(canceled: boolean) {
    const location = `${this.className}.makeWeaponInfo()`;
    const result: NewWeaponFormResult = <NewWeaponFormResult>{};

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
      const content = new NewWeaponFormContent();
      content.type = this.selectedType;
      content.name = this.inputName;
      content.rarerity = this.selectedRarerity;
      content.attack = this.inputAttack;
      if (content.rarerity === 4) {
        content.attackKai = this.inputAttackKai;
      }
      content.descriptions = this.inputDescriptions.filter((text) => text.length > 0);
      content.effects = this.inputEffects.filter((text) => text.length > 0);
      content.effectsKai = this.inputEffectsKai.filter((text) => text.length > 0);
      result.content = content;
    }

    return result;
  }
}
