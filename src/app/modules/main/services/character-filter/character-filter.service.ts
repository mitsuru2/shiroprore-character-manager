import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { FsCollectionName } from 'src/app/services/firestore-data/firestore-collection-name.enum';
import { FirestoreDataService } from 'src/app/services/firestore-data/firestore-data.service';
import {
  FsAbility,
  FsCharacter,
  FsWeaponType,
  MapCellType,
} from 'src/app/services/firestore-data/firestore-document.interface';
import { TextSearch, TextSearchResult } from '../../utils/text-search/text-search.class';
import { CharacterFilterSettings } from '../../views/character-filter-settings-form/character-filter-settings-form.interface';
import { CharacterSortSettings } from '../../views/character-sort-settings-form/character-sort-settings-form.interface';
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
  constructor(private logger: NGXLogger, private firestore: FirestoreDataService, private userAuth: UserAuthService) {
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

    this.sortCharacterListAndFilteredIndexList(characters, settings);

    return this.filteredIndexes;
  }

  //============================================================================
  // Private metods.
  //
  //----------------------------------------------------------------------------
  // Filter by filter settings.
  //
  private filterByFilterSettings(characters: FsCharacter[], filter: CharacterFilterSettings) {
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

      // Add character to the filtered index.
      this.filteredIndexes.push(i);
      this.filteredIds.push(character.id);
    }
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

    // Remove duplicated items.
    let result: MapCellType[] = [];
    if (tmpList.length === 0) {
      result.push('なし');
    } else {
      result = Array.from(new Set(tmpList));
    }

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
      if (
        (queryTokens.length > 0 && !searchResult.allTokensFound) ||
        (tagTokens.length > 0 && !matchResult.allTokensFound)
      ) {
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
    } /* if (settings.indexType === 'weaponType') */ else {
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
    }
  }
}
