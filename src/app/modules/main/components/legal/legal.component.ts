import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { NavigatorService } from '../../services/navigator/navigator.service';

@Component({
  selector: 'app-legal',
  templateUrl: './legal.component.html',
  styleUrls: ['./legal.component.scss'],
})
export class LegalComponent /*implements OnInit*/ {
  readonly className = 'LegalComponent';

  tabIndex = 0;

  constructor(private logger: NGXLogger, private route: ActivatedRoute, private navigator: NavigatorService) {
    const location = `new ${this.className}()`;
    this.logger.trace(location);

    // Get page index from URL.
    const tmp = this.route.snapshot.paramMap.get('page');
    if (tmp === 'tos') {
      this.tabIndex = 0;
    } else if (tmp === 'privacy') {
      this.tabIndex = 1;
    } else if (tmp === 'copyright') {
      this.tabIndex = 2;
    }
  }

  onTabChange() {
    const location = `${this.className}.onTabChange()`;
    this.logger.trace(location, { tabIndex: this.tabIndex });

    // Store tab index.
    this.navigator.setTabIndex('legal', this.tabIndex);
  }
}
