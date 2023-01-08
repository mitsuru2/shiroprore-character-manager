import { Component, Input, OnInit, AfterViewInit } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { CloudStorageService } from 'src/app/services/cloud-storage/cloud-storage.service';
import { FsCollectionName } from 'src/app/services/firestore-data/firestore-collection-name.enum';
import { FirestoreDataService } from 'src/app/services/firestore-data/firestore-data.service';
import {
  FsAbility,
  FsAbilityType,
  FsCharacter,
  FsCharacterType,
  FsGeographType,
  FsRegion,
  FsWeaponType,
  teamNumMax,
} from 'src/app/services/firestore-data/firestore-document.interface';
import { SpinnerService } from '../../services/spinner/spinner.service';
import { UserAuthService } from '../../services/user-auth/user-auth.service';
import { HtmlElementUtil } from '../../utils/html-element-util/html-element-util.class';
import { sleep } from '../../utils/sleep/sleep.utility';
import { isMobileMode } from '../../utils/window-size/window-size.util';

enum TableCellType {
  h1,
  h2,
  data,
}

class TeamMember {
  id: string;

  data: FsCharacter;

  url: string = '';

  thumb: Blob = new Blob();

  owned: boolean = false;

  hidden: boolean = false;

  thumbLoaded: boolean = false;

  constructor(id: string) {
    this.id = id;
    this.data = new FsCharacter(id);
  }
}

@Component({
  selector: 'app-team-view',
  templateUrl: './team-view.component.html',
  styleUrls: ['./team-view.component.scss'],
})
export class TeamViewComponent implements OnInit, AfterViewInit {
  private readonly className = 'TeamViewComponent';

  @Input() iTeam = 0;

  members: TeamMember[] = [];

  //============================================================================
  // Public functions.
  //
  constructor(
    private logger: NGXLogger,
    private userAuth: UserAuthService,
    private firestore: FirestoreDataService,
    private storage: CloudStorageService,
    private spinner: SpinnerService
  ) {
    const location = `new ${this.className}()`;

    this.logger.trace(location, { iTeam: this.iTeam });

    // Get team info when user signed in.
    this.userAuth.addEventListener('signIn', async () => {
      this.logger.debug('callback', { iTeam: this.iTeam });
      await this.redraw();
    });
  }

  ngOnInit(): void {}

  async ngAfterViewInit(): Promise<void> {
    const location = `{this.className}.ngAfterViewInit()`;
    this.logger.trace(location);
    // await sleep(1000);
    // await this.redraw();

    // Set draggable control.
  }

  private setDragAndDropBehavior() {
    const location = `${this.className}.setDragAndDropBehavior()`;
    this.logger.trace(location);

    for (let i = 0; i < this.members.length; ++i) {
      // Get list element.
      const elemId = `TeamMember_${this.members[i].data.index}`;
      const li = document.getElementById(elemId);
      if (!li) {
        this.logger.error(location, 'List element was not found.', { id: elemId });
        return;
      }

      // Set drag and drop behaviour.
      li.ondragstart = (event: DragEvent) => {
        this.logger.debug('ondragstart', { index: li.id });
        if (event.dataTransfer) {
          event.dataTransfer.setData('text/plain', li.id);
        }
      };
      li.ondragover = (event) => {
        // this.logger.debug('ondragover', { index: li.id });
        event.preventDefault();
        li.style.borderTop = '2px solid blue';
      };
      li.ondragleave = () => {
        // this.logger.debug('ondragleave', { index: li.id });
        li.style.borderTop = '';
      };
      li.ondrop = (event) => {
        // this.logger.debug('ondrop', { index: li.id });
        event.preventDefault();
        li.style.borderTop = '';
        if (event.dataTransfer) {
          // Get dragged element from dataTransfer.
          const draggedElemId = event.dataTransfer.getData('text/plain');
          this.logger.debug('ondrop', { draggedElem: draggedElemId, droppedElem: li.id });
          this.moveListItemBeforeAnotherItem(draggedElemId, li.id);
        }
      };
    }
  }

  moveListItemBeforeAnotherItem(movedItemId: string, destItemId: string) {
    const movedItem = document.getElementById(movedItemId) as HTMLLIElement;
    const destItem = document.getElementById(destItemId) as HTMLLinkElement;

    if (!movedItem || !destItem || !destItem.parentNode) {
      return;
    }

    destItem.parentNode.insertBefore(movedItem, destItem);
  }

  async onTrashClick(id: string): Promise<void> {
    this.spinner.show();

    await this.removeTeamMember(id);

    const member = this.members.find((item) => item.id === id);
    if (member) {
      member.hidden = true;
    }

    this.spinner.hide();
  }

  async redraw(): Promise<void> {
    const location = `{this.className}.redraw()`;
    this.logger.trace(location, { iTeam: this.iTeam });

    this.importTeamInfo();
    await this.loadThumbImages();
    this.updateThumbImages();
    this.makeCharacterInfoTables();
    this.setDragAndDropBehavior();
  }

  //============================================================================
  // Private methods.
  //
  //----------------------------------------------------------------------------
  // Team array control.
  //
  private importTeamInfo() {
    const team = this.getUserTeam();

    // Clear existing data.
    this.members = [];

    for (let i = 0; i < team.length; ++i) {
      // Get character data.
      const member = new TeamMember(team[i]);
      member.data = this.firestore.getDataById(FsCollectionName.Characters, member.id) as FsCharacter;

      // Get character ownership status.
      member.owned = this.userAuth.userData.characters.includes(member.id);

      /**
       * It doesn't load image data here. Because image data loading may take time.
       * Image data loading shall be done after view initialization.
       */

      // Add member info to the list.
      this.members.push(member);
    }
  }

  private getUserTeam(): string[] {
    if (this.iTeam === 0) {
      return this.userAuth.userData.team0;
    } else if (this.iTeam === 1) {
      return this.userAuth.userData.team1;
    } else {
      return this.userAuth.userData.team2;
    }
  }

  private async removeTeamMember(id: string): Promise<void> {
    let fieldName = '';
    let fieldValue = [];

    if (this.iTeam === 0) {
      this.userAuth.userData.team0 = this.userAuth.userData.team0.filter((item) => item !== id);
      fieldName = 'team0';
      fieldValue = this.userAuth.userData.team0;
    } else if (this.iTeam === 1) {
      this.userAuth.userData.team1 = this.userAuth.userData.team1.filter((item) => item !== id);
      fieldName = 'team1';
      fieldValue = this.userAuth.userData.team1;
    } else {
      this.userAuth.userData.team2 = this.userAuth.userData.team2.filter((item) => item !== id);
      fieldName = 'team2';
      fieldValue = this.userAuth.userData.team2;
    }

    await this.firestore.updateField(FsCollectionName.Users, this.userAuth.userData.id, fieldName, fieldValue);
  }

  //----------------------------------------------------------------------------
  // Thumbnail image control.
  //
  private async loadThumbImages(): Promise<number> {
    const location = `${this.className}.loadThumbImages()`;

    let thumbCount = 0;

    // Load thumbnail images.
    for (let i = 0; i < this.members.length; ++i) {
      if (this.members[i].thumbLoaded) {
        continue;
      }

      // Make storage path and load image.
      const path = this.storage.makeCharacterThumbnailPath(this.members[i].data.index);
      const blob = await this.storage.get(path);
      thumbCount++;

      // Store image property data.
      this.members[i].url = window.URL.createObjectURL(blob);
      this.members[i].thumb = blob;
      this.members[i].thumbLoaded = true;
    }

    this.logger.info(location, 'Thumbnail images are loaded.', { count: thumbCount });

    return thumbCount;
  }

  private updateThumbImages() {
    const location = `${this.className}.updateThumbImages()`;
    this.logger.trace(location, { iTeam: this.iTeam });

    // Update image element on HTML.
    for (let i = 0; i < this.members.length; ++i) {
      // Skip process if thumbnail image is not loaded.
      if (!this.members[i].thumbLoaded) {
        continue;
      }

      // Get image element.
      const index = this.members[i].data.index;
      const img = document.getElementById(`TeamMember_Thumb_${index}`) as HTMLImageElement;
      if (!img) {
        throw Error(`${location} Image element is not available.`);
      }

      // Set image URL to the image element.
      // Hide image element if the index is out of range.
      img.src = this.members[i].url;
    }
  }

  //----------------------------------------------------------------------------
  // Character info table.
  //
  private makeCharacterInfoTables() {
    const location = `${this.className}.makeCharacterInfoTable()`;

    // Make table for each characters.
    for (let i = 0; i < this.members.length; ++i) {
      const index = this.members[i].data.index;
      const tableId = `TeamMember_Table_${index}`;

      // Make character table for 'a' character.
      this.makeCharacterInfoTable(tableId, this.members[i].data);
    }
  }

  private makeCharacterInfoTable(tableId: string, character: FsCharacter) {
    const abilityTypes = this.firestore.getData(FsCollectionName.AbilityTypes) as FsAbilityType[];

    // Clear table.
    this.clearTable(tableId);

    // Get tbody element.
    const t = document.getElementById(tableId) as HTMLTableElement;

    // 1st row: Character name.
    let tr = t.insertRow();
    let td = tr.insertCell();
    td.textContent = `${character.name} (★${character.rarerity})`;
    td.colSpan = 2;
    this.setTdStyle(td, TableCellType.h1);

    // 2nd row: Basic information.
    tr = t.insertRow();
    td = tr.insertCell();
    td.textContent = '基本情報';
    this.setTdStyle(td);
    td = tr.insertCell();
    this.makeBasicInfoCellValue(td, character);
    this.setTdStyle(td);

    // Make ability info rows.
    for (let i = 0; i < abilityTypes.length; ++i) {
      this.makeAbilityInfoRows(t, character, abilityTypes[i]);
    }
  }

  private clearTable(tableId: string) {
    const t = document.getElementById(tableId) as HTMLTableElement;

    while (t.rows.length > 0) {
      t.deleteRow(0);
    }
  }

  private setTdStyle(td: HTMLTableCellElement, type: TableCellType = TableCellType.data) {
    td.style.border = 'solid';
    td.style.borderWidth = 'thin';
    td.style.borderColor = 'var(--primary-color)';

    if (type === TableCellType.h1) {
      td.style.textAlign = 'center';
      td.style.backgroundColor = 'azure';
    }
  }

  private makeBasicInfoCellValue(td: HTMLTableCellElement, character: FsCharacter) {
    let result = '';

    // Get character type.
    const characterType = this.firestore.getDataById(FsCollectionName.CharacterTypes, character.type) as FsCharacterType;

    // Weapon type.
    if (character.weaponType !== '') {
      let tmp = '武器タイプ: ';
      let wt = this.firestore.getDataById(FsCollectionName.WeaponTypes, character.weaponType) as FsWeaponType;
      tmp += wt ? wt.name : 'n.a.';
      result += tmp;
    }

    // Geograph types.
    if (character.geographTypes.length > 0) {
      let tmp = ', 地形タイプ: ';
      for (let i = 0; i < character.geographTypes.length; ++i) {
        let gt = this.firestore.getDataById(FsCollectionName.GeographTypes, character.geographTypes[i]) as FsGeographType;
        if (i > 0) {
          tmp += '/';
        }
        tmp += gt ? gt.name : 'n.a.';
      }
      result += tmp;
    }

    // Region
    if (character.region !== '') {
      let tmp = ', 地域: ';
      let rg = this.firestore.getDataById(FsCollectionName.Regions, character.region) as FsRegion;
      tmp += rg ? rg.name : 'n.a.';
      result += tmp;
    }

    // Cost.
    if (character.cost > 0) {
      let tmp = `, コスト: ${character.cost}`;
      if (characterType?.isKaichikuEnable) {
        tmp += `/${character.costKai}(改)`;
      }
      result += tmp;
    }

    // Make normal text node.
    HtmlElementUtil.appendTextNode(td, result);
  }

  private makeAbilityInfoRows(t: HTMLTableElement, character: FsCharacter, type: FsAbilityType) {
    // Filter abilities and abilities(kai).
    // const abilities = this.abilities.filter((item) => character.abilities.includes(item.id)).filter((item) => item.type === type.id);
    // const abilitiesKai = this.abilities.filter((item) => character.abilitiesKai.includes(item.id)).filter((item) => item.type === type.id);
    const abilities = (this.firestore.getDataByIds(FsCollectionName.Abilities, character.abilities) as FsAbility[]).filter((item) => item.type === type.id);
    const abilitiesKai = (this.firestore.getDataByIds(FsCollectionName.Abilities, character.abilitiesKai) as FsAbility[]).filter(
      (item) => item.type === type.id
    );

    // 2022-10-09: Show abilities by order in character ability list.
    // // Sort ability list by updated date.
    // this.firestore.sortByTimestamp(abilities, 'updatedAt');
    // this.firestore.sortByTimestamp(abilitiesKai, 'updatedAt');

    // CASE: No abilities. --> Do nothing.
    if (abilities.length === 0 && abilitiesKai.length === 0) {
      return;
    }

    // Make ability type caption.
    let tr = t.insertRow();
    let td = tr.insertCell();
    td.textContent = type.name;
    td.colSpan = 2;
    this.setTdStyle(td, TableCellType.h1);

    // Make ability name and description.
    let prevAbilityName = '';
    let prevAbilityDescCell: HTMLTableCellElement | undefined;
    for (let i = 0; i < abilities.length; ++i) {
      const ability = abilities[i];

      // Make ability name text.
      tr = t.insertRow();
      td = tr.insertCell();
      td.textContent = `[無印] ${ability.name}`;
      this.setTdStyle(td);

      // If previous ability is same, it expands row span.
      if (ability.name === prevAbilityName) {
        if (prevAbilityDescCell) {
          prevAbilityDescCell.rowSpan = 2;
        }
      }

      // Make ability description text.
      else {
        td = tr.insertCell();
        let descText = this.makeAbilityDescriptionText(ability.descriptions);

        // If the ability type is Keiryaku, add interval, cost, and token info.
        if (type.isKeiryaku && ability.interval >= 0) {
          descText += '\n' + this.makeKeiryakuPropertiesText(ability);
        }

        td.innerText = descText; // User 'innerText' property to activate line feed.
        this.setTdStyle(td);
      }

      // Update prev*** variables.
      prevAbilityName = ability.name;
      prevAbilityDescCell = td;
    }

    // Make ability info (kaichiku)
    for (let i = 0; i < abilitiesKai.length; ++i) {
      const ability = abilitiesKai[i];

      // Make ability name text.
      tr = t.insertRow();
      td = tr.insertCell();
      td.textContent = `[改壱] ${ability.name}`;
      this.setTdStyle(td);

      // If previous ability is same, it expands row span.
      if (ability.name === prevAbilityName) {
        if (prevAbilityDescCell) {
          prevAbilityDescCell.rowSpan = 2;
        }
      }

      // Make ability description text.
      else {
        td = tr.insertCell();
        let descText = this.makeAbilityDescriptionText(ability.descriptions);

        // If the ability type is Keiryaku, add interval, cost, and token info.
        if (type.isKeiryaku && ability.interval >= 0) {
          descText += '\n' + this.makeKeiryakuPropertiesText(ability);
        }

        td.innerText = descText; // User 'innerText' property to activate line feed.
        this.setTdStyle(td);
      }

      // Update prev*** variables.
      prevAbilityName = ability.name;
      prevAbilityDescCell = td;
    }
  }

  private makeAbilityDescriptionText(descriptions: string[]): string {
    let result = '';

    // CASE: Mobile mode.
    // When text length > 18 full characters, no line feed is added.
    if (isMobileMode()) {
      result = descriptions[0];
      let prevLine = descriptions[0];
      for (let i = 1; i < descriptions.length; ++i) {
        if (this.getTextLengthUtf8(prevLine) <= 18 * 2) {
          result += '\n';
        }
        result += descriptions[i];
        prevLine = descriptions[i];
      }
    }

    // CASE: PC mode.
    // Connect all lines with line feeds.
    else {
      result = descriptions[0];
      for (let i = 1; i < descriptions.length; ++i) {
        result += '\n' + descriptions[i];
      }
    }

    return result;
  }

  /**
   * It calculate text length.
   * It counts a half character as 1, and counts a full character as 2.
   * @param text Input text.
   * @returns Text length.
   */
  private getTextLengthUtf8(text: string): number {
    let count = 0;
    let c = 0;

    for (let i = 0, len = text.length; i < len; i++) {
      c = text.charCodeAt(i);
      if ((c >= 0x0 && c < 0x81) || c == 0xf8f0 || (c >= 0xff61 && c < 0xffa0) || (c >= 0xf8f1 && c < 0xf8f4)) {
        count += 1;
      } else {
        count += 2;
      }
    }

    return count;
  }

  private makeKeiryakuPropertiesText(ability: FsAbility): string {
    let result = '';

    if (ability.tokenLayouts.length === 0) {
      result += `(CT:${ability.interval}秒 / 消費気:${ability.cost})`;
    } else {
      let tokenLayoutText = '';
      this.firestore.sortMapCellTypes(ability.tokenLayouts);
      for (let j = 0; j < ability.tokenLayouts.length; ++j) {
        if (j > 0) {
          tokenLayoutText += ',';
        }
        tokenLayoutText += ability.tokenLayouts[j];
      }
      result += `(CT:${ability.interval}秒 / 消費気:${ability.cost} / 配置:${tokenLayoutText})`;
    }

    return result;
  }
}
