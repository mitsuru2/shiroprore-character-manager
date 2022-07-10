import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-top-menu-m',
  templateUrl: './top-menu-m.component.html',
  styleUrls: ['./top-menu-m.component.scss'],
})
export class TopMenuMComponent /*implements OnInit*/ {
  readonly className = 'TopMenuMComponent';

  /** Menu dialog. */
  @Input() menuItems: MenuItem[] = [];

  menuShown = false;

  @Output() requestGoToHomeEvent = new EventEmitter<boolean>();

  constructor(private logger: NGXLogger) {}

  // ngOnInit(): void {}

  onLogoIconClick() {
    this.requestGoToHomeEvent.emit(true);
  }
}
