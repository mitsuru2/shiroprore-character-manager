import { Component } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { ConfirmationService } from 'primeng/api';
import { CloudStorageService } from 'src/app/services/cloud-storage/cloud-storage.service';
import { ErrorHandlerService } from 'src/app/services/error-handler/error-handler.service';
import { FsCollectionName } from 'src/app/services/firestore-data/firestore-collection-name.enum';
import { FirestoreDataService } from 'src/app/services/firestore-data/firestore-data.service';
import { AbilityAttrType, abilityAttrTypes, FsAbility, FsAbilityAttribute } from 'src/app/services/firestore-data/firestore-document.interface';
import { SpinnerService } from '../../services/spinner/spinner.service';
import { UserAuthService } from '../../services/user-auth/user-auth.service';
import { AbilityAnalyzer } from '../../utils/ability-analyzer/ability-analyzer.class';
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

  //     if (this.isAttrChanged(a.attributes, attributes)) {
  //       // Debug print.
  //       this.inquiryData.body += `${i},${a.id},${a.name}\n`;

  //       // Copy attribute information into the FsAbility data type.
  //       a.attributes = [];
  //       for (let j = 0; j < attributes.length; ++j) {
  //         a.attributes.push(attributes[j]);
  //       }

  //       // Update attribute field.
  //       await this.firestore.updateField(FsCollectionName.Abilities, a.id, 'attributes', a.attributes);
  //       await sleep(100);
  //     }
  //   }

  //   this.spinner.hide();
  // }

  // private isAttrChanged(org: FsAbilityAttribute[], mod: FsAbilityAttribute[]): boolean {
  //   if (org.length !== mod.length) {
  //     return true;
  //   }

  //   for (let i = 0; i < org.length; ++i) {
  //     if (org[i].type !== mod[i].type) {
  //       return true;
  //     }
  //     if (org[i].value !== mod[i].value) {
  //       return true;
  //     }
  //     if (org[i].isStepEffect !== mod[i].isStepEffect) {
  //       return true;
  //     }
  //   }

  //   return false;
  // }

  // printAbilityData() {
  //   const abilities = this.firestore.getData(FsCollectionName.Abilities) as FsAbility[];

  //   this.spinner.show();

  //   this.inquiryData.body += '[\n';
  //   for (let i = 0; i < abilities.length; ++i) {
  //     let text = `'${abilities[i].name}',\n`;
  //     this.inquiryData.body += text;
  //   }
  //   this.inquiryData.body += '];\n[\n';
  //   for (let i = 0; i < abilities.length; ++i) {
  //     let text = `'${abilities[i].descriptions.join('')}',\n`;
  //     this.inquiryData.body += text;
  //   }
  //   this.inquiryData.body += '];\n';

  //   this.spinner.hide();
  // }

  // printAbilityDataAsCsv() {
  //   const abilities = this.firestore.getData(FsCollectionName.Abilities) as FsAbility[];
  //   const analyzer = new AbilityAnalyzer();

  //   this.spinner.show();

  //   this.inquiryData.body = 'Index,Name,Description';
  //   for (let i = 0; i < abilityAttrTypes.length; ++i) {
  //     this.inquiryData.body += `,${abilityAttrTypes[i]}`;
  //   }
  //   this.inquiryData.body += '\n';

  //   for (let i = 0; i < abilities.length; ++i) {
  //     const ability = abilities[i];
  //     const desc = ability.descriptions.join('');
  //     const attributes = analyzer.analyze(ability.descriptions);
  //     let index = 0;

  //     this.inquiryData.body += `${i},${ability.name},${desc}`;

  //     for (let j = 0; j < abilityAttrTypes.length; ++j) {
  //       this.inquiryData.body += ',';
  //       index = attributes.findIndex((item) => item.type === abilityAttrTypes[j]);
  //       if (index >= 0) {
  //         this.inquiryData.body += `${attributes[index].value}(${attributes[index].isStepEffect})`;
  //       }
  //     }
  //     this.inquiryData.body += '\n';
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
