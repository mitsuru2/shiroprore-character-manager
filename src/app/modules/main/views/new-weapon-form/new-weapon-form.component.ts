import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { FsCollectionName } from 'src/app/services/firestore-data/firestore-collection-name.enum';
import { FirestoreDataService } from 'src/app/services/firestore-data/firestore-data.service';
import { FsWeapon, fsWeaponRarerityMax, FsWeaponType } from 'src/app/services/firestore-data/firestore-document.interface';
import { NewWeaponFormData, NewWeaponFormMode } from './new-weapon-form.interface';

@Component({
  selector: 'app-new-weapon-form',
  templateUrl: './new-weapon-form.component.html',
  styleUrls: ['./new-weapon-form.component.scss'],
})
export class NewWeaponFormComponent implements OnInit {
  //============================================================================
  // Class members.
  //
  private readonly className = 'NewWeaponFormComponent';

  /** Appearance. */
  @Input() mode: NewWeaponFormMode = 'normal';

  @Input() styleClass = '';

  @Input() okLabel = 'Ok';

  @Input() cancelLabel = 'Cancel';

  @Input() buttonStyleClass = '';

  /** Form data. */
  @Input() weaponData!: NewWeaponFormData;

  @Output() weaponDataChange = new EventEmitter<NewWeaponFormData>();

  @Output() canceled = new EventEmitter<boolean>();

  /** Weapon types. */
  weaponTypeItems = this.firestore.getData(FsCollectionName.WeaponTypes) as FsWeaponType[];

  /** Rarerity */
  rarerityItems: number[] = [];

  rarerityShown = true;

  /** Description */
  inputDescriptions: string[] = [''];

  /** Effect */
  inputEffects: string[] = ['', '', ''];

  inputEffectsKai: string[] = ['', '', ''];

  /** Error message. */
  errorMessage = '';

  //============================================================================
  // Class methods.
  //
  constructor(private logger: NGXLogger, private firestore: FirestoreDataService) {
    this.logger.trace(`new ${this.className}()`);

    // Initialize rarerity list.
    for (let i = 0; i < fsWeaponRarerityMax; ++i) {
      this.rarerityItems.push(i + 1);
    }
  }

  ngOnInit(): void {
    const location = `${this.className}.ngOnInit()`;
    this.logger.trace(location);

    /** Copy description and effect text. */
    for (let i = 0; i < this.weaponData.descriptions.length; ++i) {
      this.inputDescriptions[i] = this.weaponData.descriptions[i].slice();
    }
    for (let i = 0; i < this.weaponData.effects.length; ++i) {
      this.inputEffects[i] = this.weaponData.effects[i].slice();
    }
    for (let i = 0; i < this.weaponData.effectsKai.length; ++i) {
      this.inputEffectsKai[i] = this.weaponData.effectsKai[i].slice();
    }

    /** Sort weapon type. */
    this.firestore.sortByCode(this.weaponTypeItems);

    /** Rarerity field switch. */
    this.rarerityShown = !this.weaponData.type.isFixed;
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

  onWeaponTypeClick() {
    const location = `${this.className}.onWeaponTypeClick()`;
    this.logger.trace(location);

    this.rarerityShown = !this.weaponData.type.isFixed;
  }

  onNameInputChange() {
    const location = `${this.className}.onNameInputChange()`;
    this.logger.trace(location);

    const weapons = this.firestore.getData(FsCollectionName.Weapons) as FsWeapon[];
    for (let weapon of weapons) {
      if (weapon.name === this.weaponData.name) {
        this.logger.warn(location, 'Existing weapon name.', { name: this.weaponData.name });
        this.errorMessage = '既に登録済の名前です。';
        return;
      }
    }

    this.errorMessage = '';
  }

  onOkClick() {
    const location = `${this.className}.onOkClick()`;
    this.logger.trace(location);

    this.makeWeaponData();
    this.weaponDataChange.emit(this.weaponData);
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
  private makeWeaponData() {
    // Update rarerity value if fixed weapon.
    if (this.weaponData.type.isFixed) {
      this.weaponData.rarerity = -1;
    }

    // Copy weapon and effect description text.
    if (this.mode === 'normal') {
      this.weaponData.descriptions = this.inputDescriptions.filter((text) => text.length > 0);
      this.weaponData.effects = this.inputEffects.filter((text) => text.length > 0);
      this.weaponData.effectsKai = this.inputEffectsKai.filter((text) => text.length > 0);
    }
  }
}
