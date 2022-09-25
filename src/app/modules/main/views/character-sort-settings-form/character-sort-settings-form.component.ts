import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import {
  CharacterSortDirectionTypes,
  CharacterSortIndexTypes,
  CharacterSortSettings,
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
  @Input() sortSettings!: CharacterSortSettings;

  @Output() sortSettingsChange = new EventEmitter<CharacterSortSettings>();

  /** Index type. */
  sortIndexTypes = CharacterSortIndexTypes;

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
    this.sortSettingsChange.emit(this.sortSettings);
    this.canceled.emit(false);
  }

  onCancelClick() {
    const location = `${this.className}.onCancelClick()`;
    this.logger.trace(location);
    this.canceled.emit(true);
  }
}
