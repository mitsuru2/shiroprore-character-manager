import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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

  /** Form result. */
  @Input() filterSettings!: CharacterFilterSettings;

  @Output() filterSettingsChange = new EventEmitter<CharacterFilterSettings>();

  /** User character ownership status type. */
  readonly ownershipStatusTypeItems = CharacterOwnershipStatusTypes;

  selectedOwnershipStatusType = CharacterOwnershipStatusTypes[0];

  //============================================================================
  // Class methods.
  //
  constructor() {}

  ngOnInit(): void {}
}
