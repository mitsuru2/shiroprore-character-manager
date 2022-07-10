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
      // disabled: !this.userAuth.signedIn,
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
            this.router.navigateByUrl('/main/new-character').then(() => {
              try {
                this.newCharacterComponent.showNewCharacterForm = true;
              } catch {
                // do nothing.
              }
            });
          },
          disabled: !this.userAuth.signedIn,
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
          label: 'ログイン',
          visible: !this.userAuth.signedIn,
          command: () => {
            this.signIn();
          },
        },
        {
          label: 'ログアウト',
          visible: this.userAuth.signedIn,
          command: () => {
            this.signOut();
          },
        },
      ],
    },
  ];

  //============================================================================
  // Class methods.
  //
  constructor(private logger: NGXLogger, private router: Router, public userAuth: UserAuthService) {
    this.logger.trace(`new ${this.className}()`);

    this.userAuth.addEventListener('signIn', this.onUserAuthChanged.bind(this));
    this.userAuth.addEventListener('signOut', this.onUserAuthChanged.bind(this));
  }

  signIn() {
    this.router.navigateByUrl('/main/login');
  }

  signOut() {
    const location = `${this.className}.signOut()`;
    this.logger.trace(location);

    this.userAuth.signOut();
  }

  goToStartupScreen() {
    this.router.navigateByUrl('');
  }

  //============================================================================
  // Private methods.
  //
  //----------------------------------------------------------------------------
  // User sign in/out event listners.
  //
  private onUserAuthChanged() {
    const location = `${this.className}.onUserSignedIn()`;
    this.logger.trace(location, { signedIn: this.userAuth.signedIn });

    // let menuItem = this.sideMenuItems.find((item) => item.label && item.label === '新規キャラクター登録');
    // if (menuItem) {
    //   menuItem.disabled = !this.userAuth.signedIn;
    // }
    let menuItemM = this.sideMenuItemsM[0].items.find((item) => item.label && item.label === '新規キャラクター登録');
    if (menuItemM) {
      menuItemM.disabled = !this.userAuth.signedIn;
    }
    menuItemM = this.sideMenuItemsM[0].items.find((item) => item.label && item.label === 'ログイン');
    if (menuItemM) {
      menuItemM.visible = !this.userAuth.signedIn;
    }
    menuItemM = this.sideMenuItemsM[0].items.find((item) => item.label && item.label === 'ログアウト');
    if (menuItemM) {
      menuItemM.visible = this.userAuth.signedIn;
    }
  }
}
