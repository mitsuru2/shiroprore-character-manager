import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { MenuItem } from 'primeng/api';
import { AppInfo } from 'src/app/app-info.enum';

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

  helpDialogShown = false;

  constructor(private logger: NGXLogger) {
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
    this.helpDialogShown = true;
  }
}
