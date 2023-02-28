import { Component } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { NavigatorService } from '../../services/navigator/navigator.service';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss'],
})
export class SupportComponent {
  readonly className = 'SupportComponent';

  tabIndex = 0;

  constructor(private logger: NGXLogger, private navigator: NavigatorService) {
    const location = `new ${this.className}()`;
    this.logger.trace(location);
  }

  onTabChange() {
    const location = `${this.className}.onTabChange()`;
    this.logger.trace(location, { tabIndex: this.tabIndex });

    // Store tab index.
    this.navigator.setTabIndex('support', this.tabIndex);
  }
}
