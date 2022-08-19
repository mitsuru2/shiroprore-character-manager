import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { ConfirmationService } from 'primeng/api';
import { ErrorHandlerService } from 'src/app/services/error-handler/error-handler.service';
import { FsCollectionName } from 'src/app/services/firestore-data/firestore-collection-name.enum';
import { FirestoreDataService } from 'src/app/services/firestore-data/firestore-data.service';
import { SpinnerService } from '../../services/spinner/spinner.service';
import { UserAuthService } from '../../services/user-auth/user-auth.service';
import { sleep } from '../../utils/sleep/sleep.utility';

@Component({
  selector: 'app-remove-user-data',
  templateUrl: './remove-user-data.component.html',
  styleUrls: ['./remove-user-data.component.scss'],
})
export class RemoveUserDataComponent /*implements OnInit*/ {
  private readonly className = 'RemoveUserDataComponent';

  private isConfirmed: boolean = false;

  private isRemoveAllowed: boolean = false;

  //============================================================================
  // Class methods.
  //
  constructor(
    private logger: NGXLogger,
    private firestore: FirestoreDataService,
    private userAuth: UserAuthService,
    private errorHandler: ErrorHandlerService,
    private confirmationDialog: ConfirmationService,
    private spinner: SpinnerService,
    private router: Router
  ) {
    this.logger.trace(`new ${this.className}()`);
  }

  async onRemoveUserDataButtonClick() {
    const location = `${this.className}.onRemoveUserDataButtonClick()`;
    this.logger.trace(location);

    // Show confirmation dialog if user is not signed in.
    if (!this.userAuth.signedIn) {
      this.notifyUserNotSignedIn();
      return;
    }

    // Confirm before remove data.
    this.confirmRemoveUserData();
    while (!this.isConfirmed) {
      await sleep(200);
    }
    this.logger.debug(location, { confirmed: this.isConfirmed, allowed: this.isRemoveAllowed });
    if (!this.isRemoveAllowed) {
      return;
    }

    // Else, try to remove the user data.
    try {
      this.spinner.show();

      // Remove user data.
      await this.firestore.removeData(FsCollectionName.Users, this.userAuth.userData.id);

      // Remove user definition.
      await this.userAuth.removeCurrentUser();

      this.spinner.hide();
    } catch (error) {
      this.errorHandler.notifyError(error);
    }

    // Show confirmation dialog.
    this.notifyUserDataRemoved();
  }

  //============================================================================
  // Private methods.
  //
  //----------------------------------------------------------------------------
  // Confirmation dialog.
  //
  private notifyUserNotSignedIn() {
    this.confirmationDialog.confirm({ message: 'ログインしていません。', acceptLabel: 'ＯＫ', rejectVisible: false });
  }

  private confirmRemoveUserData() {
    this.isConfirmed = false;

    this.confirmationDialog.confirm({
      message: 'ユーザーデータを削除します。よろしいですか？',
      acceptLabel: 'ＯＫ',
      rejectLabel: 'キャンセル',
      accept: () => {
        this.isConfirmed = true;
        this.isRemoveAllowed = true;
      },
      reject: () => {
        this.isConfirmed = true;
        this.isRemoveAllowed = false;
      },
    });
  }

  private notifyUserDataRemoved() {
    this.confirmationDialog.confirm({
      message: 'ユーザーデータを削除しました。ホーム画面に戻ります。',
      acceptLabel: 'ＯＫ',
      rejectVisible: false,
      accept: () => {
        this.router.navigateByUrl('/');
      },
    });
  }
}
