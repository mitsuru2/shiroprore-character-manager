import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
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

  @Output() requestSignInEvent = new EventEmitter<boolean>();

  @Output() requestSignOutEvent = new EventEmitter<boolean>();

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
}
