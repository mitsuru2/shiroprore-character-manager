import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { AppInfo } from 'src/app/app-info.enum';
import { NewCharacterComponent } from './components/new-character/new-character.component';
import { UserAuthService } from './services/user-auth/user-auth.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent /*implements OnInit*/ {
  readonly className = 'MainComponent';

  @ViewChild(NewCharacterComponent)
  private newCharacterComponent!: NewCharacterComponent;

  appInfo = AppInfo;

  sideMenuItems = [
    {
      label: '新規キャラクター登録',
      command: () => {
        this.router.navigateByUrl('/main/new-character').then(() => {
          try {
            this.newCharacterComponent.showNewCharacterForm = true;
          } catch {
            // do nothing.
          }
        });
      },
    },
    {
      label: 'キャラクター一覧',
      command: () => {
        this.router.navigateByUrl('/main/list-character');
      },
    },
    {
      label: 'コピーライト表記',
      command: () => {
        this.router.navigateByUrl('/main/legal');
      },
    },
  ];

  sideMenuItemsM = [
    {
      label: this.appInfo.title + '<br />' + this.appInfo.subTitle,
      escape: false,
      items: [
        {
          label: '新規キャラクター登録',
          command: () => {
            this.router.navigateByUrl('/main/new-character');
          },
        },
        {
          label: 'キャラクター一覧',
          command: () => {
            this.router.navigateByUrl('/main/list-character');
          },
        },
        {
          label: 'コピーライト表記',
          command: () => {
            this.router.navigateByUrl('/main/legal');
          },
        },
        {
          label: 'ユーザー設定',
          command: () => {},
        },
        {
          separator: true,
        },
        {
          label: 'サインイン',
          visible: !this.userAuth.signedIn,
          command: () => {},
        },
        {
          label: 'サインアウト',
          visible: this.userAuth.signedIn,
          command: () => {},
        },
      ],
    },
  ];

  constructor(private logger: NGXLogger, private router: Router, private userAuth: UserAuthService) {
    this.logger.trace(`new ${this.className}()`);
  }

  signIn() {
    this.router.navigateByUrl('/main/login');
  }

  signOut() {
    const location = `${this.className}.signOut()`;
    this.logger.trace(location);

    this.userAuth.signOut();
  }

  isSignedIn() {
    return this.userAuth.signedIn;
  }
}
