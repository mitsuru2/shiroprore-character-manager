import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { AppInfo } from 'src/app/app-info.enum';
import { AppNavigateService } from 'src/app/services/app-navigate/app-navigate.service';
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
          visible: !this.navigator.signedIn,
          command: () => {},
        },
        {
          label: 'サインアウト',
          visible: this.navigator.signedIn,
          command: () => {},
        },
      ],
    },
  ];

  constructor(private logger: NGXLogger, private router: Router, public navigator: AppNavigateService) {
    this.logger.trace(`new ${this.className}()`);
  }

  askSignOut(): void {
    const location = `${this.className}.askSignOut()`;
    this.logger.trace(location);
  }

  async navigate(url: string): Promise<boolean> {
    const location = `${this.className}.navigate()`;
    this.logger.trace(location, { url: url });

    return this.router.navigateByUrl(url);
  }
}
