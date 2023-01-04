import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { teamNumMax } from 'src/app/services/firestore-data/firestore-document.interface';
import { makeNumberArray } from '../../utils/array/array.util';
import { TeamViewComponent } from '../../views/team-view/team-view.component';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss'],
})
export class TeamComponent implements OnInit {
  readonly className = 'TeamComponent';

  tabIndexes: number[] = makeNumberArray(teamNumMax);

  activeTabIndex: number = 0;

  @ViewChildren(TeamViewComponent) teamViews!: QueryList<TeamViewComponent>;

  constructor(private logger: NGXLogger) {
    const location = `new ${this.className}()`;
    this.logger.trace(location);
  }

  ngOnInit(): void {}

  onTabChange(event: any) {
    const location = `${this.className}.onTabChange()`;
    const index = event.index;

    this.logger.trace(location, { index: index, child: this.teamViews.find((item) => item.iTeam === index)?.iTeam });

    //this.teamViews.find((item) => item.iTeam === index)?.redraw();
  }
}
