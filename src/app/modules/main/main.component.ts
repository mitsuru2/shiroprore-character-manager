import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { ConfirmationService } from 'primeng/api';
import { AppInfo } from 'src/app/app-info.enum';
import { NewCharacterComponent } from './components/new-character/new-character.component';

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

  signedIn = true;

  sideMenuItems = [
    {
      label: '新規キャラクター登録',
      command: () => {
        this.navigate('/main/new-character').then(() => {
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
        this.navigate('/main/list-character');
      },
    },
    {
      label: 'コピーライト表記',
      command: () => {
        this.navigate('/main/legal');
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
            this.navigate('/main/new-character');
          },
        },
        {
          label: 'キャラクター一覧',
          command: () => {
            this.navigate('/main/list-character');
          },
        },
        {
          label: 'コピーライト表記',
          command: () => {
            this.navigate('/main/legal');
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
          visible: !this.signedIn,
          command: () => {},
        },
        {
          label: 'サインアウト',
          visible: this.signedIn,
          command: () => {},
        },
      ],
    },
  ];

  constructor(private logger: NGXLogger, private confirmDialog: ConfirmationService, private router: Router) {
    this.logger.trace(`new ${this.className}()`);
  }

  askSignOut(): void {
    const location = `${this.className}.askSignOut()`;
    this.logger.trace(location);

    this.confirmDialog.confirm({
      message: 'Are you sure to sign out?',
      accept: () => {
        this.signedIn = false;
      },
    });
  }

  async navigate(url: string): Promise<boolean> {
    const location = `${this.className}.navigate()`;
    this.logger.trace(location, { url: url });

    return this.router.navigateByUrl(url);
  }
}
