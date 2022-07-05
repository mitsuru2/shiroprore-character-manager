import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { AppInfo } from 'src/app/app-info.enum';

@Component({
  selector: 'app-top-menu',
  templateUrl: './top-menu.component.html',
  styleUrls: ['./top-menu.component.scss'],
})
export class TopMenuComponent /*implements OnInit*/ {
  appInfo = AppInfo;

  @Input() signedIn: boolean = false;

  @Output() requestSignOutEvent = new EventEmitter<boolean>();

  constructor(private logger: NGXLogger) {
    this.logger.trace('new TopMenuComponent()');
  }

  // ngOnInit(): void {}

  requestSignOut() {
    this.logger.trace('TopMenuComponent.requestSignOut()');
    this.requestSignOutEvent.emit(true);
  }
}
