import { Component } from '@angular/core';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss'],
})
export class SupportComponent {
  readonly className = 'SupportComponent';

  tabIndex = 0;

  constructor(private logger: NGXLogger) {
    const location = `new ${this.className}()`;
    this.logger.trace(location);
  }
}
