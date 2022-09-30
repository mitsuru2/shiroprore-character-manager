import { Component } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { ConfirmationService } from 'primeng/api';
import { CloudStorageService } from 'src/app/services/cloud-storage/cloud-storage.service';
import { ErrorHandlerService } from 'src/app/services/error-handler/error-handler.service';
import { SpinnerService } from '../../services/spinner/spinner.service';
import { UserAuthService } from '../../services/user-auth/user-auth.service';
import { InquiryFormData } from './inquiry-form.interface';

@Component({
  selector: 'app-inquiry-form',
  templateUrl: './inquiry-form.component.html',
  styleUrls: ['./inquiry-form.component.scss'],
})
export class InquiryFormComponent /*implements OnInit*/ {
  private readonly className = 'InquiryFormComponent';

  inquiryData = new InquiryFormData();

  //============================================================================
  // Class methods.
  //
  constructor(
    private logger: NGXLogger,
    private storage: CloudStorageService,
    private userAuth: UserAuthService,
    private spinner: SpinnerService,
    private confirmationDialog: ConfirmationService,
    private errorHandler: ErrorHandlerService
  ) {}

  // ngOnInit(): void {}

  async onOkClick() {
    // Check user login.
    if (!this.userAuth.signedIn) {
      this.notifyUserNotSignedIn();
      return;
    }

    this.spinner.show();

    try {
      // Make text file data.
      const datetime = new Date();
      const textFileData = this.makeTextFileData(datetime);

      // Upload the created text file to cloud storage.
      const path = this.makeInquiryTextPath(datetime);
      await this.storage.upload(path, textFileData);
    } catch (error) {
      this.spinner.hide();
      this.errorHandler.notifyError(error);
    }

    // Clear form data after submit.
    this.inquiryData = new InquiryFormData();

    this.spinner.hide();

    // Show message dialog.
    this.notifyInquirySubmitted();
  }

  //============================================================================
  // Private methods.
  //
  //----------------------------------------------------------------------------
  // Text file.
  //
  private makeTextFileData(datetime: Date): Blob {
    let textData = `Datetime: ${datetime.toString()}\n`;

    textData += '\n';
    textData += `User ID: ${this.userAuth.userId}\n`;
    textData += `User data ID: ${this.userAuth.userData.id}\n`;

    textData += '\n';
    textData += `Title: ${this.inquiryData.title}\n`;

    textData += '\n';
    textData += `Body:\n`;
    textData += this.inquiryData.body;

    return new Blob([textData], { type: 'text/plain' });
  }

  private makeInquiryTextPath(datetime: Date): string {
    const datetimeText = datetime.toISOString().replace(/:/g, '-').substr(0, 19);

    return `inquiries/${datetimeText}_${this.userAuth.userId}.txt`;
  }

  //----------------------------------------------------------------------------
  // Confirmation dialogs.
  //
  private notifyUserNotSignedIn() {
    this.confirmationDialog.confirm({ message: 'ログインしていません。', acceptLabel: 'OK', rejectVisible: false });
  }

  private notifyInquirySubmitted() {
    this.confirmationDialog.confirm({
      message: '問い合わせ内容を送信しました。',
      acceptLabel: 'OK',
      rejectVisible: false,
    });
  }
}
