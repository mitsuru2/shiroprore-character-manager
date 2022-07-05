import { Component } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import {
  FsAbility,
  FsAbilityType,
  FsCharacter,
  FsCharacterTag,
  FsCharacterType,
  FsDocumentBase,
  FsFacility,
  FsFacilityType,
  FsGeographType,
  FsIllustrator,
  FsRegion,
  FsSubCharacterType,
  FsVoiceActor,
  FsWeapon,
  FsWeaponType,
} from 'src/app/services/firestore-data/firestore-document.interface';
import { FirestoreDataService } from 'src/app/services/firestore-data/firestore-data.service';
import { FsCollectionName } from 'src/app/services/firestore-data/firestore-collection-name.enum';
import {
  FsAbilityForNewCharacterForm,
  NewCharacterFormContent,
  NewCharacterFormResult,
} from '../../views/new-character-form/new-character-form.interface';
import { csCharacterImageTypes } from 'src/app/services/cloud-storage/cloud-storage.interface';
import { CloudStorageService } from 'src/app/services/cloud-storage/cloud-storage.service';

@Component({
  selector: 'app-new-character',
  templateUrl: './new-character.component.html',
  styleUrls: ['./new-character.component.scss'],
})
export class NewCharacterComponent /*implements OnInit*/ {
  className: string = 'NewCharacterComponent';

  /** Firestore data */
  abilities = this.firestore.getData(FsCollectionName.Abilities) as FsAbility[];

  abilityTypes = this.firestore.getData(FsCollectionName.AbilityTypes) as FsAbilityType[];

  characterTypes = this.firestore.getData(FsCollectionName.CharacterTypes) as FsCharacterType[];

  characterTags = this.firestore.getData(FsCollectionName.CharacterTags) as FsCharacterTag[];

  characters = this.firestore.getData(FsCollectionName.Characters) as FsCharacter[];

  facilityTypes = this.firestore.getData(FsCollectionName.FacilityTypes) as FsFacilityType[];

  facilities = this.firestore.getData(FsCollectionName.Facilities) as FsFacility[];

  geographTypes = this.firestore.getData(FsCollectionName.GeographTypes) as FsGeographType[];

  illustrators = this.firestore.getData(FsCollectionName.Illustrators) as FsIllustrator[];

  regions = this.firestore.getData(FsCollectionName.Regions) as FsRegion[];

  voiceActors = this.firestore.getData(FsCollectionName.VoiceActors) as FsVoiceActor[];

  weaponTypes = this.firestore.getData(FsCollectionName.WeaponTypes) as FsWeaponType[];

  weapons = this.firestore.getData(FsCollectionName.Weapons) as FsWeapon[];

  /** New character form. */
  showNewCharacterForm = true;

  newCharacterFormContent = new NewCharacterFormContent();

  /** New character confirmation dialog. */
  showConfirmationDialog = false;

  /** Progress spinner dialog. */
  showProgressDialog = false;

  //============================================================================
  // Class methods.
  //
  constructor(
    private logger: NGXLogger,
    private firestore: FirestoreDataService,
    private storage: CloudStorageService
  ) {
    this.logger.trace(`new ${this.className}()`);
  }

  // ngOnInit(): void {}

  onNewCharacterFormResult(formResult: NewCharacterFormResult) {
    const location = `${this.className}.onNewCharacterFormResult()`;
    this.logger.trace(location, { formResult: formResult });

    /** If valid data input, open the confirmation dialog. */
    if (!formResult.canceled && formResult.content) {
      this.newCharacterFormContent = formResult.content;
      this.showConfirmationDialog = true;
    }

    /** Clear shown flag. */
    this.showNewCharacterForm = false;
  }

  async onNewCharacterConfirmResult(result: boolean) {
    const location = `${this.className}.onNewCharacterConfirmResult()`;
    this.logger.trace(location, { confirmationResult: result });

    // Close dialog.
    this.showConfirmationDialog = false;

    // If canceled, process stop here.
    if (!result) {
      return;
    }

    // Show progress spinner.
    this.showNewCharacterForm = true;
    this.showProgressDialog = true;

    // Upload input data.
    const index = await this.uploadCharacterInfo(this.newCharacterFormContent);
    if (index.length > 0) {
      await this.uploadCharacterImages(this.newCharacterFormContent, index);
      this.logger.info(location, 'Finished.');
    } else {
      this.logger.error(location, 'Invalid character index.', { index: index });
    }

    // Reload firestore data.
    await this.reloadFsData();

    this.showProgressDialog = false;
    this.showNewCharacterForm = false;
  }

  //============================================================================
  // Private methods.
  //
  private async uploadCharacterInfo(formContent: NewCharacterFormContent): Promise<string> {
    const location = `${this.className}.uploadCharacterInfo()`;

    // Make character info to be registered.
    const character = this.makeCharacterInfo(formContent);
    let docId = '';

    // Check input voice actors.
    if (formContent.voiceActor.name !== '') {
      // Add new data if not existing, and get document ID.
      docId = await this.addDataAndGetDocumentId(FsCollectionName.VoiceActors, formContent.voiceActor);

      // Store document ID of voice actor.
      character.voiceActors.push(docId);
    } else {
      this.logger.warn(location, 'No voice actor input.');
    }

    // Check input illustrators.
    if (formContent.illustrator.name !== '') {
      // Add new data if not existing, and get document ID.
      docId = await this.addDataAndGetDocumentId(FsCollectionName.Illustrators, formContent.illustrator);

      // Store document ID of illustrator.
      character.illustrators.push(docId);
    } else {
      this.logger.warn(location, 'No illustrator input.');
    }

    // Check input motif weapons.
    for (let i = 0; i < formContent.motifWeapons.length; ++i) {
      // Add new data if not existing, and get document ID.
      docId = await this.addDataAndGetDocumentId(FsCollectionName.Weapons, formContent.motifWeapons[i]);

      // Store document ID of motif weapons.
      character.motifWeapons.push(docId);
    }

    // Check input motif facilities.
    for (let i = 0; i < formContent.motifFacilities.length; ++i) {
      // Add new data if not existing, and get document ID.
      docId = await this.addDataAndGetDocumentId(FsCollectionName.Facilities, formContent.motifFacilities[i]);

      // Store document ID of motif facilities.
      character.motifFacilities.push(docId);
    }

    // Check input character tags.
    for (let i = 0; i < formContent.characterTags.length; ++i) {
      // Add new data if not existing, and get document ID.
      docId = await this.addDataAndGetDocumentId(FsCollectionName.CharacterTags, formContent.characterTags[i]);

      // Store document ID of character tags.
      character.tags.push(docId);
    }

    // Check input abilities.
    for (let i = 0; i < formContent.abilities.length; ++i) {
      // Convert ability data for Firestore.
      const ability = this.convFsAbilityInfo(formContent.abilities[i]);

      // Add new data if not existing, and get document ID.
      docId = await this.addDataAndGetDocumentId(FsCollectionName.Abilities, ability);

      // Store document ID of ability.
      character.abilities.push(docId);
    }

    // Check input abilities (kaichiku).
    for (let i = 0; i < formContent.abilitiesKai.length; ++i) {
      // Convert ability data for Firestore.
      const ability = this.convFsAbilityInfo(formContent.abilitiesKai[i]);

      // Add new data if not existing, and get document ID.
      docId = await this.addDataAndGetDocumentId(FsCollectionName.Abilities, ability);

      // Store document ID of ability.
      character.abilitiesKai.push(docId);
    }

    // Make character index.
    character.index = await this.makeNewCharacterIndex(formContent.characterType, formContent.subCharacterType);
    this.logger.info(location, { character: character });

    // Upload character info.
    const characterId = await this.firestore.addData(FsCollectionName.Characters, character);

    // Update character tag info.
    if (character.tags) {
      // Reload tag info.
      await this.firestore.load(FsCollectionName.CharacterTags);

      // Add character ID to tag.
      for (let i = 0; i < this.characterTags.length; ++i) {
        for (let j = 0; j < character.tags.length; ++j) {
          if (this.characterTags[i].id === character.tags[j]) {
            // Add character ID to the tag info.
            await this.firestore.pushToListField<string>(
              FsCollectionName.CharacterTags,
              this.characterTags[i].id,
              'characters',
              characterId
            );
          }
        }
      }
    }

    return character.index;
  }

  private makeCharacterInfo(formContent?: NewCharacterFormContent): FsCharacter {
    // Make blank character info.
    const character = new FsCharacter();

    // If form result is available, copy a part of information.
    if (formContent) {
      character.type = formContent.characterType.id;
      character.subType = formContent.subCharacterType.id;
      character.name = formContent.characterName;
      character.rarerity = formContent.rarerity;
      character.weaponType = formContent.weaponType.id;
      character.geographTypes = formContent.geographTypes.map((item) => item.id);
      character.region = formContent.region.id;
      character.cost = formContent.cost;
      character.costKai = formContent.costKai;
    }

    return character;
  }

  private convFsAbilityInfo(src: FsAbilityForNewCharacterForm): FsAbility {
    const result = new FsAbility();

    result.id = src.id;
    result.name = src.name;
    result.type = src.type;
    result.cost = src.cost;
    result.interval = src.interval;
    result.descriptions = src.descriptions;
    result.tokenLayouts = src.tokenLayouts;

    return result;
  }

  private async addDataAndGetDocumentId(name: FsCollectionName, data: FsDocumentBase): Promise<string> {
    const location = `${this.className}.addDataAndGetDocumentId()`;
    let docId = '';
    const refData = this.firestore.getData(name);

    this.logger.trace(location, { name: name, dataName: data.name });

    // Check if the voice actor is new or existing.
    let isFound = false;
    for (let i = 0; i < refData.length; ++i) {
      if (refData[i].name === data.name) {
        isFound = true;
        docId = refData[i].id;
        this.logger.debug(location, 'existing');
        break;
      }
    }
    if (!isFound) {
      // Upload voice actor info.
      docId = await this.firestore.addData(name, data);
      this.logger.debug(location, 'new data', { docId: docId });
    }

    return docId;
  }

  private async makeNewCharacterIndex(type: FsCharacterType, subType: FsSubCharacterType): Promise<string> {
    // const location = `${this.className}.makeNewCharacterIndex()`;
    let index = '';
    let code = type.code;
    let subCode = subType.code;
    let count = 0;

    // Increment and get character type count.
    count = await this.firestore.incrementCounter(FsCollectionName.CharacterTypes, type.id);
    if (subCode !== '00') {
      count = await this.firestore.incrementCounter(FsCollectionName.CharacterTypes, type.id, 'SubTypes', subType.id);
    }

    // Make string index.
    index = `${code}-${subCode}-${(count - 1).toString(16).padStart(4, '0')}`;

    return index;
  }

  private async uploadCharacterImages(formContent: NewCharacterFormContent, index: string) {
    // const location = `${this.className}.uploadCharacterImages()`;

    // Upload images before kaichiku.
    for (let i = 0; i < formContent.imageFiles.length; ++i) {
      if (formContent.imageFiles[i]) {
        const imagePath = this.storage.makeCharacterImagePath(index, csCharacterImageTypes[i].type, false);
        await this.storage.upload(imagePath, formContent.imageFiles[i]);
      }
    }
    // Upload thumbnail.
    if (formContent.thumbnailImage) {
      const imagePath = this.storage.makeCharacterThumbnailPath(index);
      await this.storage.upload(imagePath, formContent.thumbnailImage);
    }
    // Upload images after kaichiku.
    for (let i = 0; i < formContent.imageFilesKai.length; ++i) {
      if (formContent.imageFilesKai[i]) {
        const imagePath = this.storage.makeCharacterImagePath(index, csCharacterImageTypes[i].type, true);
        await this.storage.upload(imagePath, formContent.imageFilesKai[i]);
      }
    }
  }

  private async reloadFsData() {
    await Promise.all([
      this.firestore.load(FsCollectionName.Abilities),
      this.firestore.load(FsCollectionName.CharacterTags),
      this.firestore.load(FsCollectionName.Characters),
      this.firestore.load(FsCollectionName.Facilities),
      this.firestore.load(FsCollectionName.VoiceActors),
      this.firestore.load(FsCollectionName.Illustrators),
      this.firestore.load(FsCollectionName.Weapons),
    ]);
  }
}
