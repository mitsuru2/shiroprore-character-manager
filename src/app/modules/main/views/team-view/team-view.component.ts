import { Component, Input, OnInit } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { teamNumMax } from 'src/app/services/firestore-data/firestore-document.interface';
import { UserAuthService } from '../../services/user-auth/user-auth.service';

@Component({
  selector: 'app-team-view',
  templateUrl: './team-view.component.html',
  styleUrls: ['./team-view.component.scss'],
})
export class TeamViewComponent implements OnInit {
  private readonly className = 'TeamViewComponent';

  @Input() iTeam = 0;

  teams: string[][] = Array(teamNumMax);

  constructor(private logger: NGXLogger, private userAuth: UserAuthService) {
    const location = `new ${this.className}()`;

    this.logger.trace(location, { iTeam: this.iTeam });

    // Get team info.
    this.teams[0] = this.userAuth.userData.team0;
    this.teams[1] = this.userAuth.userData.team1;
    this.teams[2] = this.userAuth.userData.team2;

    // TODO: ユーザーログインされたときにチーム情報を初期化しなおす。
  }

  ngOnInit(): void {}
}
