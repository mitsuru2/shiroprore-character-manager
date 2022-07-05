import { Component, Input } from '@angular/core';
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

  constructor(private logger: NGXLogger) {}

  // ngOnInit(): void {}
}
