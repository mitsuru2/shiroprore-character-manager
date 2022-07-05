import { Component, Input } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
})
export class SideMenuComponent /*implements OnInit*/ {
  readonly className = 'SideMenuComponent';

  @Input() menuItems: MenuItem[] = [];

  constructor(private logger: NGXLogger) {
    this.logger.trace(`new ${this.className}()`);
  }
}
