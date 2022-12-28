import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { ConfirmationService } from 'primeng/api';
import { AppInfo } from 'src/app/app-info.enum';
import { FsCollectionName } from 'src/app/services/firestore-data/firestore-collection-name.enum';
import { FirestoreDataService } from 'src/app/services/firestore-data/firestore-data.service';
import { NewCharacterComponent } from './components/new-character/new-character.component';
import { SpinnerService } from './services/spinner/spinner.service';
import { UserAuthService } from './services/user-auth/user-auth.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent /*implements OnInit*/ {
  private readonly className = 'MainComponent';

  private readonly oneDayInMs = 24 * 60 * 60 * 1000;

  private readonly recentDateNum = 4;

  @ViewChild(NewCharacterComponent)
  private newCharacterComponent!: NewCharacterComponent;

  appInfo = AppInfo;

  spinnerShown = false;

  sideMenuItems = [
    {
      label: 'キャラクター一覧',
      command: () => {
        this.router.navigateByUrl('/main/list-character');
      },
    },
    {
      label: 'キャラクター編成',
      command: () => {
        this.onTeamEditMenuClick();
      },
    },
    {
      label: 'キャラクター所持状況',
      command: () => {
        this.onCharacterOwnershipStatusMenuClick();
      },
    },
    {
      label: '新規キャラクター登録',
      command: () => {
        this.onNewCharacterMenuClick();
      },
    },
    {
      label: 'サポート',
      command: () => {
        this.router.navigateByUrl('/main/support');
      },
    },
    {
      label: 'ツール説明',
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
          label: 'キャラクター一覧',
          command: () => {
            this.router.navigateByUrl('/main/list-character');
          },
        },
        {
          label: 'キャラクター編成',
          command: () => {
            this.onTeamEditMenuClick();
          },
        },
        {
          label: 'キャラクター所持状況',
          command: () => {
            this.onCharacterOwnershipStatusMenuClick();
          },
        },
        {
          label: '新規キャラクター登録',
          command: () => {
            this.onNewCharacterMenuClick();
          },
        },
        {
          label: 'サポート',
          command: () => {
            this.router.navigateByUrl('/main/support');
          },
        },
        {
          label: 'ツール説明',
          command: () => {
            this.router.navigateByUrl('/main/legal');
          },
        },
        {
          separator: true,
        },
        {
          label: 'ログイン',
          visible: !this.userAuth.signedIn,
          command: () => {
            this.goToLoginPage();
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
  constructor(
    private logger: NGXLogger,
    private firestore: FirestoreDataService,
    private router: Router,
    public userAuth: UserAuthService,
    private confirmationDialog: ConfirmationService,
    private spinner: SpinnerService
  ) {
    this.logger.trace(`new ${this.className}()`);

    // Register user authorization event handler.
    this.userAuth.addEventListener('signIn', this.onUserAuthChanged.bind(this));
    this.userAuth.addEventListener('signOut', this.onUserAuthChanged.bind(this));

    // Register spinner dialog on/off control.
    this.spinner.addSpinnerControlFunction('show', () => {
      this.spinnerShown = true;
    });
    this.spinner.addSpinnerControlFunction('hide', () => {
      this.spinnerShown = false;
    });

    // Check latest version update and add text to the menu item.
    const versions = this.firestore.getData(FsCollectionName.Versions);
    if (versions.length > 0) {
      // Get latest version date and today.
      this.firestore.sortByTimestamp(versions, 'createdAt', true);
      const latestVersionDate = this.firestore.convTimestampToDate(versions[0].createdAt);
      const today = new Date();

      // Add text to the support menu label if the latest version date is within 4 days.
      if ((today.getTime() - latestVersionDate.getTime()) / this.oneDayInMs <= this.recentDateNum) {
        this.sideMenuItems[3].label += '(update)';
        this.sideMenuItemsM[0].items[3].label += '(update)';
      }
    }
  }

  goToLoginPage() {
    this.router.navigateByUrl('/main/login');
  }

  async signOut() {
    const location = `${this.className}.signOut()`;
    this.logger.trace(location);

    await this.userAuth.signOut();
    this.showLogoutConfirmation();
  }

  goToStartupScreen() {
    this.firestore.loadAll();
    this.router.navigateByUrl('');
  }

  //============================================================================
  // Private methods.
  //
  //----------------------------------------------------------------------------
  // User sign in/out event listners.
  //
  private onUserAuthChanged() {
    const location = `${this.className}.onUserAuthChanged()`;
    this.logger.trace(location, { signedIn: this.userAuth.signedIn });

    let menuItemM = this.sideMenuItemsM[0].items.find((item) => item.label && item.label === 'ログイン');
    if (menuItemM) {
      menuItemM.visible = !this.userAuth.signedIn;
    }
    menuItemM = this.sideMenuItemsM[0].items.find((item) => item.label && item.label === 'ログアウト');
    if (menuItemM) {
      menuItemM.visible = this.userAuth.signedIn;
    }
  }

  //----------------------------------------------------------------------------
  // Menu item handler.
  //
  private onNewCharacterMenuClick() {
    if (this.userAuth.signedIn) {
      this.router.navigateByUrl('/main/new-character');
    } else {
      // Show warning message.
      this.confirmationDialog.confirm({
        message: 'キャラクターデータの作成にはログインが必要です。',
        acceptLabel: 'OK',
        rejectVisible: false,
      });
    }
  }

  private onTeamEditMenuClick() {
    if (this.userAuth.signedIn) {
      this.router.navigateByUrl('/main/team-edit');
    } else {
      this.confirmationDialog.confirm({
        message: 'キャラクター編成機能にはログインが必要です。',
        acceptLabel: 'OK',
        rejectVisible: false,
      });
    }
  }

  private onCharacterOwnershipStatusMenuClick() {
    if (this.userAuth.signedIn) {
      this.router.navigateByUrl('/main/list-character-ownership');
    } else {
      this.confirmationDialog.confirm({
        message: 'キャラクター所持状況の管理にはログインが必要です。',
        acceptLabel: 'OK',
        rejectVisible: false,
      });
    }
  }

  private showLogoutConfirmation() {
    this.confirmationDialog.confirm({
      message: 'ログアウトしました。',
      acceptLabel: 'OK',
      rejectVisible: false,
      accept: () => {
        this.router.navigateByUrl('/');
      },
    });
  }
}
