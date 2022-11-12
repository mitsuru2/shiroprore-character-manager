import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import {
  CharacterSortAbilityAttrTypes,
  CharacterSortDirectionTypes,
  CharacterSortIndexTypes,
  CharacterSortSetting,
} from './character-sort-settings-form.interface';

@Component({
  selector: 'app-character-sort-settings-form',
  templateUrl: './character-sort-settings-form.component.html',
  styleUrls: ['./character-sort-settings-form.component.scss'],
})
export class CharacterSortSettingsFormComponent {
  private readonly className = 'CharacterSortSettingsFormComponent';

  /** Appearance. */
  @Input() buttonStyleClass = '';

  @Input() hideButton = false;

  /** Form result. */
  @Input() sortSetting!: CharacterSortSetting;

  @Output() sortSettingChange = new EventEmitter<CharacterSortSetting>();

  /** Index type. */
  sortIndexTypes = CharacterSortIndexTypes;

  sortIndexTypesDetail = CharacterSortAbilityAttrTypes;

  /** Sort directions. */
  sortDirectionTypes = CharacterSortDirectionTypes;

  /** Button event. */
  @Output() canceled = new EventEmitter<boolean>();

  //============================================================================
  // Class methods.
  //
  constructor(private logger: NGXLogger) {
    const location = `new ${this.className}()`;
    this.logger.trace(location);
  }

  onOkClick() {
    const location = `${this.className}.onOkClick()`;
    this.logger.trace(location);
    this.sortSettingChange.emit(this.sortSetting);
    this.canceled.emit(false);
  }

  onCancelClick() {
    const location = `${this.className}.onCancelClick()`;
    this.logger.trace(location);
    this.canceled.emit(true);
  }
}
