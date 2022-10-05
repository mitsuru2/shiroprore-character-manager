import { Component } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { ConfirmationService } from 'primeng/api';
import { CloudStorageService } from 'src/app/services/cloud-storage/cloud-storage.service';
import { ErrorHandlerService } from 'src/app/services/error-handler/error-handler.service';
import { FsCollectionName } from 'src/app/services/firestore-data/firestore-collection-name.enum';
import { FirestoreDataService } from 'src/app/services/firestore-data/firestore-data.service';
import { FsAbility } from 'src/app/services/firestore-data/firestore-document.interface';
import { SpinnerService } from '../../services/spinner/spinner.service';
import { UserAuthService } from '../../services/user-auth/user-auth.service';
import { AbilityAnalyzer } from '../../utils/analyze-ability/ability-analyzer.class';
import { sleep } from '../../utils/sleep/sleep.utility';
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
    private errorHandler: ErrorHandlerService,
    private firestore: FirestoreDataService
  ) {}

  // ngOnInit(): void {}

  async onOkClick() {
    // Anyone can post the inquiry.
    // // Check user login.
    // if (!this.userAuth.signedIn) {
    //   this.notifyUserNotSignedIn();
    //   return;
    // }

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

  /**
   * ONLY FOR DEVELOPMENT. DON'T DEPLOY!!!
   * Scan all ability data and update ability attribute information.
   */
  // async updateAbilityAttributesAll(): Promise<void> {
  //   const abilities = this.firestore.getData(FsCollectionName.Abilities) as FsAbility[];
  //   const analyzer = new AbilityAnalyzer();

  //   this.spinner.show();

  //   for (let i = 0; i < abilities.length; ++i) {
  //     const a = abilities[i];

  //     // Analyze ability description text.
  //     const attributes = analyzer.analyze(a.descriptions);

  //     if (attributes.length > 0) {
  //       this.inquiryData.body += `${i},${a.id},${a.name}\n`;

  //       // Copy attribute information into the FsAbility data type.
  //       for (let j = 0; j < attributes.length; ++j) {
  //         const attr = attributes[j];
  //         a.attributes.push({ type: attr.type, value: attr.value });
  //       }

  //       // Update attribute field.
  //       await this.firestore.updateField(FsCollectionName.Abilities, a.id, 'attributes', a.attributes);
  //       await sleep(100);
  //     }
  //   }

  //   this.spinner.hide();
  // }

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
