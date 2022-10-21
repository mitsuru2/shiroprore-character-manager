import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { ErrorCode } from 'src/app/services/error-handler/error-code.enum';
import { ErrorHandlerService } from 'src/app/services/error-handler/error-handler.service';
import { FsCollectionName } from 'src/app/services/firestore-data/firestore-collection-name.enum';
import { FirestoreDataService } from 'src/app/services/firestore-data/firestore-data.service';
import {
  AbilityAttrType,
  abilityAttrTypes,
  FsAbility,
  FsAbilityType,
  FsCharacter,
  FsWeaponType,
  MapCellType,
} from 'src/app/services/firestore-data/firestore-document.interface';
import { TextSearch, TextSearchResult } from '../../utils/text-search/text-search.class';
import { CharacterFilterSettings, CharacterTypeFilterType } from '../../views/character-filter-settings-form/character-filter-settings-form.interface';
import { CharacterSortDirectionType, CharacterSortSettings } from '../../views/character-sort-settings-form/character-sort-settings-form.interface';
import { UserAuthService } from '../user-auth/user-auth.service';

interface TextPropertyMap {
  cate: 'name' | 'voice' | 'illust' | 'tag' | 'ability' | 'abilityKai';
  index?: number;
}

@Injectable({
  providedIn: 'root',
})
export class CharacterFilterService {
  private readonly className = 'CharacterFilterService';

  private filteredIndexes: number[] = [];

  private filteredIds: string[] = [];

  //============================================================================
  // Class methods.
  //
  constructor(
    private logger: NGXLogger,
    private firestore: FirestoreDataService,
    private userAuth: UserAuthService,
    private errorHandler: ErrorHandlerService
  ) {
    this.logger.trace(`new ${this.className}()`);
  }

  filter(characters: FsCharacter[], filter: CharacterFilterSettings, query: string): number[] {
    const location = `${this.className}.filter()`;
    this.logger.trace(location, { filter: filter, query: query });

    this.filterByFilterSettings(characters, filter);
    this.filterBySearchText(characters, query);

    return this.filteredIndexes;
  }

  sort(characters: FsCharacter[], settings: CharacterSortSettings): number[] {
    const location = `${this.className}.sort()`;
    this.logger.trace(location, { settings: settings });

    try {
      this.sortCharacterListAndFilteredIndexList(characters, settings);
    } catch (e) {
      this.errorHandler.notifyError(e);
    }

    return this.filteredIndexes;
  }

  //============================================================================
  // Private metods.
  //
  //----------------------------------------------------------------------------
  // Filter by filter settings.
  //
  private filterByFilterSettings(characters: FsCharacter[], filter: CharacterFilterSettings) {
    const location = `${this.className}.filterByFilterSettings()`;

    this.filteredIndexes = [];
    this.filteredIds = [];

    for (let i = 0; i < characters.length; ++i) {
      const character = characters[i];

      // Ownership status.
      if (filter.ownershipFilterType === 'all') {
        // Do nothing. Go to next filter.
      } else if (filter.ownershipFilterType === 'hasOnly') {
        if (this.userAuth.signedIn) {
          if (!this.userAuth.userData.characters.includes(character.id)) {
            continue;
          }
        }
      } else {
        if (this.userAuth.signedIn) {
          if (this.userAuth.userData.characters.includes(character.id)) {
            continue;
          }
        }
      }

      // Character GACHA type.
      if (filter.characterTypes.length === 0) {
        // Do nothing. Go to next filter.
      } else {
        // Calc character GACHA type.
        const type = this.calcCharacterGachaType(character);
        if (!filter.characterTypes.includes(type)) {
          continue;
        }
      }

      // Rarerity.
      if (filter.rarerities.length === 0) {
        // Do nothing. Go to next filter.
      } else {
        if (!filter.rarerities.includes(character.rarerity)) {
          continue;
        }
      }

      // Weapon type.
      if (filter.weaponTypes.length === 0) {
        // Do nothing. Go to next filter.
      } else {
        if (!filter.weaponTypes.includes(character.weaponType)) {
          continue;
        }
      }

      // Geograph type.
      if (filter.geographTypes.length === 0) {
        // Do nothing. Go to next filter.
      } else {
        let found = false;
        for (let j = 0; j < character.geographTypes.length; ++j) {
          if (filter.geographTypes.includes(character.geographTypes[j])) {
            found = true;
            break;
          }
        }
        if (!found) {
          continue;
        }
      }

      // Region.
      if (filter.regions.length === 0) {
        // Do nothing. Go to next filter.
      } else {
        if (!filter.regions.includes(character.region)) {
          continue;
        }
      }

      // Ownership ability, team ability, or defeated time ability supported.
      if (!filter.ownershipAbility && !filter.teamAbility && !filter.defeatedTimeAbility) {
        // Do nothing. Go to next filter.
      } else {
        // Scan all abilities of the character.
        let ownershipAbilityFound = false;
        let teamAbilityFound = false;
        let defeatedTimeAbilityFound = false;
        for (let j = 0; j < character.abilities.length; ++j) {
          const ability = this.firestore.getDataById(FsCollectionName.Abilities, character.abilities[j]) as FsAbility;
          const abilityType = this.firestore.getDataById(FsCollectionName.AbilityTypes, ability.type) as FsAbilityType;
          if (abilityType.name === '所持特技') {
            ownershipAbilityFound = true;
          } else if (abilityType.name === '編成特技') {
            teamAbilityFound = true;
          } else if (abilityType.name === '大破特技') {
            defeatedTimeAbilityFound = true;
          }
        }
        for (let j = 0; j < character.abilitiesKai.length; ++j) {
          const ability = this.firestore.getDataById(FsCollectionName.Abilities, character.abilitiesKai[j]) as FsAbility;
          const abilityType = this.firestore.getDataById(FsCollectionName.AbilityTypes, ability.type) as FsAbilityType;
          if (abilityType.name === '所持特技') {
            ownershipAbilityFound = true;
          } else if (abilityType.name === '編成特技') {
            teamAbilityFound = true;
          } else if (abilityType.name === '大破特技') {
            defeatedTimeAbilityFound = true;
          }
        }

        // Filter by ownership ability.
        if (filter.ownershipAbility) {
          if (!ownershipAbilityFound) {
            continue;
          }
        }

        // Filter by team ability.
        if (filter.teamAbility) {
          if (!teamAbilityFound) {
            continue;
          }
        }

        // Filter by defeated time ability.
        if (filter.defeatedTimeAbility) {
          if (!defeatedTimeAbilityFound) {
            continue;
          }
        }
      }

      // Token type.
      if (filter.tokenTypes.length === 0) {
        // Do nothing. Go to next filter.
      } else {
        // Get token layout list.
        const tokenTypes = this.extractTokenTypesFromCharacter(character);

        // Check token type.
        let found = false;
        for (let j = 0; j < tokenTypes.length; ++j) {
          if (filter.tokenTypes.includes(tokenTypes[j])) {
            found = true;
            break;
          }
        }
        if (!found) {
          continue;
        }
      }

      // Implemented date.
      if (filter.startDate) {
        // Case: Start date is specified.
        //       Do 'continue' if the implemented date is before start date or is not defined.
        if (!character.implementedDate) {
          continue;
        }
        const implementedDate = this.firestore.convTimestampToDate(character.implementedDate);
        if (implementedDate < filter.startDate) {
          continue;
        }
      }
      if (filter.endDate) {
        // Case: End date is specified.
        //       Do 'continue' if the implemented date is after end date or is not defined.
        if (!character.implementedDate) {
          continue;
        }
        const implementedDate = this.firestore.convTimestampToDate(character.implementedDate);
        if (implementedDate > filter.endDate) {
          continue;
        }
      }

      // Ability attribute types.
      if (filter.abilityAttributes.length === 0) {
        // Do nothing. Go to next filter.
      } else {
        if (!this.checkAbilityAttributes(character, filter.abilityAttributes)) {
          continue;
        }
      }

      // Add character to the filtered index.
      this.filteredIndexes.push(i);
      this.filteredIds.push(character.id);
    }
  }

  private checkAbilityAttributes(character: FsCharacter, attributes: AbilityAttrType[]): boolean {
    // Get abilities.
    const tmp = character.abilities.concat(character.abilitiesKai);
    const abilityIds = Array.from(new Set(tmp));
    const abilities = this.firestore.getDataByIds(FsCollectionName.Abilities, abilityIds) as FsAbility[];

    // Scan abilities.
    for (let i = 0; i < abilities.length; ++i) {
      for (let j = 0; j < attributes.length; ++j) {
        if (abilities[i].attributes.findIndex((item) => item.type === attributes[j]) >= 0) {
          return true;
        }
      }
    }

    return false;
  }

  private calcCharacterGachaType(character: FsCharacter): CharacterTypeFilterType {
    const present = 'wOLpjxD8RGtcIfFN2Ss8';
    const specialPaidPack = 'uZsmpYs392nTCcwvM6fk';

    // Season limited characters.
    if (
      character.name.includes('[正月]') ||
      character.name.includes('[バレンタイン]') ||
      character.name.includes('[学園]') ||
      character.name.includes('[端午]') ||
      character.name.includes('[花嫁衣装]') ||
      character.name.includes('[夏]') ||
      character.name.includes('[肝試し]') ||
      character.name.includes('[お月見]') ||
      character.name.includes('[ハロウィン]') ||
      character.name.includes('[聖夜]')
    ) {
      return 'season';
    }

    // Kenran characters.
    if (character.name.includes('[絢爛]')) {
      return 'kenran';
    }

    // Ura characters.
    if (character.name.includes('[裏]')) {
      return 'ura';
    }

    // Others.
    // --> Hell, Collaboration, DMM, Kabuto-musume, present or special paid pack.
    const characterType = this.firestore.getDataById(FsCollectionName.CharacterTypes, character.type);
    if (characterType.name !== '城娘') {
      return 'others';
    }
    const geographTypes = this.firestore.getDataByIds(FsCollectionName.GeographTypes, character.geographTypes);
    if (geographTypes.find((item) => item.name === '地獄')) {
      return 'others';
    }
    if (character.internalTags.length > 0) {
      if (character.internalTags.includes(present) || character.internalTags.includes(specialPaidPack)) {
        return 'others';
      }
    }

    // Normal characters.
    return 'normal';
  }

  private extractTokenTypesFromCharacter(character: FsCharacter): MapCellType[] {
    const abilities = this.firestore.getData(FsCollectionName.Abilities) as FsAbility[];
    let tmpList: MapCellType[] = [];

    // Make token layout list.
    for (let i = 0; i < character.abilities.length; ++i) {
      const ability = abilities.find((item) => item.id === character.abilities[i]);
      if (ability) {
        tmpList = tmpList.concat(ability.tokenLayouts);
      }
    }
    for (let i = 0; i < character.abilitiesKai.length; ++i) {
      const ability = abilities.find((item) => item.id === character.abilitiesKai[i]);
      if (ability) {
        tmpList = tmpList.concat(ability.tokenLayouts);
      }
    }

    // Add "赤青".
    if (tmpList.includes('赤') && tmpList.includes('青')) {
      tmpList.push('赤青');
    }

    // Remove duplicated items.
    let result: MapCellType[] = [];
    result = Array.from(new Set(tmpList));

    return result;
  }

  //----------------------------------------------------------------------------
  // Filter by query text.
  //
  private filterBySearchText(characters: FsCharacter[], queryText: string) {
    // const location = `${this.className}.filterBySearchText()`;

    // Do nothing if query text is blank.
    if (queryText === '') {
      return;
    }

    // Parse query text and separate normal query and tag query.
    const parsedTokens = TextSearch.parseInputText(queryText);
    const queryTokens: string[] = [];
    const tagTokens: string[] = [];
    for (let i = 0; i < parsedTokens.length; ++i) {
      if (parsedTokens[i].charAt(0) === '#') {
        tagTokens.push(parsedTokens[i].slice(1));
      } else {
        queryTokens.push(parsedTokens[i]);
      }
    }

    // Check each characters.
    // It skips characters which is already filtered.
    for (let i = this.filteredIndexes.length - 1; i >= 0; --i) {
      // Get target character.
      const character = characters[this.filteredIndexes[i]];

      // Make text search object and register text properties of the character.
      // Run quick search.
      let searchResult = new TextSearchResult();
      if (queryTokens.length > 0) {
        const textSearch = this.makeTextSearch(character);
        searchResult = textSearch.quickSearch(queryText);
      }

      // Make text search object and register text properties of the character.
      // Run tag match search.
      let matchResult = new TextSearchResult();
      if (tagTokens.length > 0) {
        const textSearch = this.makeTagTextSearch(character);
        matchResult = textSearch.match(tagTokens);
      }

      // Remove index if the query text is not found.
      if ((queryTokens.length > 0 && !searchResult.allTokensFound) || (tagTokens.length > 0 && !matchResult.allTokensFound)) {
        this.filteredIndexes.splice(i, 1);
        this.filteredIds.splice(i, 1);
      }
    }
  }

  private makeTextSearch(character: FsCharacter): TextSearch {
    const ts = new TextSearch();
    let text = '';

    // Character name.
    ts.add(character.name, { cate: 'name' } as TextPropertyMap);

    // CV and illustrator.
    for (let i = 0; i < character.voiceActors.length; ++i) {
      text = this.firestore.getDataById(FsCollectionName.VoiceActors, character.voiceActors[i]).name;
      if (text !== '') {
        ts.add(text, { cate: 'voice' } as TextPropertyMap);
      }
    }
    for (let i = 0; i < character.illustrators.length; ++i) {
      text = this.firestore.getDataById(FsCollectionName.Illustrators, character.illustrators[i]).name;
      if (text !== '') {
        ts.add(text, { cate: 'illust' } as TextPropertyMap);
      }
    }

    // Tag.
    // for (let i = 0; i < character.tags.length; ++i) {
    //   text = this.firestore.getDataById(FsCollectionName.CharacterTags, character.tags[i]).name;
    //   if (text !== '') {
    //     ts.add(text, { cate: 'tag', index: i } as TextPropertyMap);
    //   }
    // }

    // Abilities.
    for (let i = 0; i < character.abilities.length; ++i) {
      const ability = this.firestore.getDataById(FsCollectionName.Abilities, character.abilities[i]) as FsAbility;
      if (ability.descriptions.length > 0) {
        ts.add(ability.descriptions, { cate: 'ability', index: i } as TextPropertyMap);
      }
    }

    // Abilities (Kaichiku).
    for (let i = 0; i < character.abilitiesKai.length; ++i) {
      const ability = this.firestore.getDataById(FsCollectionName.Abilities, character.abilitiesKai[i]) as FsAbility;
      if (ability.descriptions.length > 0) {
        ts.add(ability.descriptions, { cate: 'abilityKai', index: i } as TextPropertyMap);
      }
    }

    return ts;
  }

  private makeTagTextSearch(character: FsCharacter): TextSearch {
    const ts = new TextSearch();
    let text = '';

    // Tag.
    for (let i = 0; i < character.tags.length; ++i) {
      text = this.firestore.getDataById(FsCollectionName.CharacterTags, character.tags[i]).name;
      if (text !== '') {
        ts.add(text, { cate: 'tag', index: i } as TextPropertyMap);
      }
    }

    return ts;
  }

  //----------------------------------------------------------------------------
  // Sorting
  //
  private sortCharacterListAndFilteredIndexList(characters: FsCharacter[], sortSettings: CharacterSortSettings) {
    // Sort character list.
    this.sortCharacterList(characters, { indexType: 'identifier', direction: 'asc' });
    this.sortCharacterList(characters, sortSettings);

    // Make filtered index list.
    this.filteredIndexes = [];
    for (let i = 0; i < characters.length; ++i) {
      if (this.filteredIds.includes(characters[i].id)) {
        this.filteredIndexes.push(i);
      }
    }
  }

  private sortCharacterList(characters: FsCharacter[], settings: CharacterSortSettings) {
    if (settings.indexType === 'identifier') {
      characters.sort((a, b) => {
        if (settings.direction === 'asc') {
          return a.index < b.index ? -1 : 1;
        } else {
          return b.index < a.index ? -1 : 1;
        }
      });
    } else if (settings.indexType === 'rarerity') {
      characters.sort((a, b) => {
        if (settings.direction === 'asc') {
          return a.rarerity < b.rarerity ? -1 : 1;
        } else {
          return b.rarerity < a.rarerity ? -1 : 1;
        }
      });
    } else if (settings.indexType === 'weaponType') {
      const weaponTypes = this.firestore.getData(FsCollectionName.WeaponTypes) as FsWeaponType[];
      this.firestore.sortByCode(weaponTypes);
      const weaponTypeIds = weaponTypes.map((item) => item.id);

      characters.sort((a, b) => {
        const indexA = weaponTypeIds.indexOf(a.weaponType);
        const indexB = weaponTypeIds.indexOf(b.weaponType);

        if (settings.direction === 'asc') {
          return indexA < indexB ? -1 : 1;
        } else {
          return indexB < indexA ? -1 : 1;
        }
      });
    } else if (settings.indexType === 'implementedDate') {
      characters.sort((a, b) => {
        if (!a.implementedDate) {
          if (!b.implementedDate) {
            return 1; // b --> a
          } else {
            return 1; // b --> a
          }
        } else {
          if (!b.implementedDate) {
            return -1; // a --> b
          } else {
            // CASE: Both 'a' and 'b' have valid date data.
            //       It sorts by date data.
            if (settings.direction === 'asc') {
              return a.implementedDate.seconds < b.implementedDate.seconds ? -1 : 1;
            } else {
              return b.implementedDate.seconds < a.implementedDate.seconds ? -1 : 1;
            }
          }
        }
      });
    } else if (abilityAttrTypes.includes(settings.indexType)) {
      this.sortByAbilityAttrValue(characters, settings.indexType, settings.direction);
    } else {
      const error = new Error(ErrorCode.Unexpected);
      error.message = 'Implementation error. Please check character sort settings.';
      throw error;
    }
  }

  private sortByAbilityAttrValue(characters: FsCharacter[], attrType: AbilityAttrType, direction: CharacterSortDirectionType) {
    characters.sort((a, b) => {
      // Get ability attribute values.
      const valueA = this.getMaxAbilityAttrValue(a, attrType);
      const valueB = this.getMaxAbilityAttrValue(b, attrType);
      // Sort.
      if (direction === 'asc') {
        return valueA < valueB ? -1 : 1;
      } else {
        return valueB < valueA ? -1 : 1;
      }
    });
  }

  private getMaxAbilityAttrValue(character: FsCharacter, attrType: AbilityAttrType): number {
    // Get all ability data of the character.
    const abilityIds = Array.from(new Set(character.abilities.concat(character.abilitiesKai)));
    const abilities = this.firestore.getDataByIds(FsCollectionName.Abilities, abilityIds) as FsAbility[];

    // Scan abilities and find max attribute value.
    let result = 0;
    for (let i = 0; i < abilities.length; ++i) {
      const ability = abilities[i];
      if (ability.attributes.findIndex((item) => item.type === attrType) < 0) {
        continue;
      }
      for (let j = 0; j < ability.attributes.length; ++j) {
        const attr = abilities[i].attributes[j];
        if (attr.type === attrType) {
          // Conpensate ability attribute value by characters rarerity.
          let value = attr.value;
          if (attr.isStepEffect) {
            if (character.rarerity <= 1) {
              value *= 3;
            } else if (character.rarerity === 2) {
              if (character.abilitiesKai.includes(ability.id)) {
                value *= 4;
              } else {
                value *= 3;
              }
            } else if (character.rarerity === 3) {
              value *= 4;
            } else if (character.rarerity === 5) {
              if (character.abilitiesKai.includes(ability.id)) {
                value *= 5;
              } else {
                value *= 4;
              }
            } else {
              value *= 5;
            }
          }

          // Update max value if current attribute value is larger than previous max value.
          if (value > result) {
            result = value;
          }
        }
      }
    }

    return result;
  }
}
