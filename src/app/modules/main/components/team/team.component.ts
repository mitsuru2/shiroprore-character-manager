import { Component /*OnInit*/ } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { teamNumMax } from 'src/app/services/firestore-data/firestore-document.interface';
import { makeNumberArray } from '../../utils/array/array.util';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss'],
})
export class TeamComponent /*implements OnInit*/ {
  readonly className = 'TeamComponent';

  readonly tabIndexes: number[];

  activeTabIndex: number = 0;

  constructor(private logger: NGXLogger) {
    const location = `new ${this.className}()`;
    this.tabIndexes = makeNumberArray(teamNumMax);
    this.logger.trace(location, { indexArray: this.tabIndexes });
  }
}
