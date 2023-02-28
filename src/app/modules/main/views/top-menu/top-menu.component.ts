import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { MenuItem } from 'primeng/api';
import { AppInfo } from 'src/app/app-info.enum';
import { NavigatorService } from '../../services/navigator/navigator.service';
import { DynamicHelpComponent } from '../dynamic-help/dynamic-help.component';

@Component({
  selector: 'app-top-menu',
  templateUrl: './top-menu.component.html',
  styleUrls: ['./top-menu.component.scss'],
})
export class TopMenuComponent /*implements OnInit*/ {
  readonly className = 'TopMenuComponent';

  appInfo = AppInfo;

  @Input() signedIn: boolean = false;

  /** Menu dialog. */
  @Input() menuItems: MenuItem[] = [];

  @Output() requestSignInEvent = new EventEmitter<boolean>();

  @Output() requestSignOutEvent = new EventEmitter<boolean>();

  @Output() requestGoHomeEvent = new EventEmitter<boolean>();

  /** Dynamic help. */
  @ViewChild(DynamicHelpComponent) private dynamicHelpComp!: DynamicHelpComponent;

  helpDialogShown = false;

  constructor(private logger: NGXLogger, private navigator: NavigatorService) {
    this.logger.trace('new TopMenuComponent()');
  }

  // ngOnInit(): void {}

  onSignInClick() {
    const location = `${this.className}.onSigneInClick()`;
    this.logger.trace(location);

    this.requestSignInEvent.emit(true);
  }

  onSignOutClick() {
    const location = `${this.className}.onSignOutClick()`;
    this.logger.trace(location);
    this.requestSignOutEvent.emit(true);
  }

  onLogoIconClick() {
    const location = `${this.className}.onLogoIconClick()`;
    this.logger.trace(location);

    this.requestGoHomeEvent.emit(true);
  }

  onHelpIconClick() {
    const location = `${this.className}.onHelpIconClick()`;
    this.logger.trace(location, { path: this.navigator.currentPath });

    this.dynamicHelpComp.path = this.navigator.currentPath;
    if (this.navigator.currentPath === 'legal') {
      this.dynamicHelpComp.tabIndex = this.navigator.getTabIndex('legal');
    } else if (this.navigator.currentPath === 'support') {
      this.dynamicHelpComp.tabIndex = this.navigator.getTabIndex('support');
    }

    this.helpDialogShown = true;
  }
}
