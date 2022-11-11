import { Component, OnInit } from '@angular/core';
import { Timestamp } from 'firebase/firestore';
import { NGXLogger } from 'ngx-logger';
import { AppInfo } from 'src/app/app-info.enum';
import { FsCollectionName } from 'src/app/services/firestore-data/firestore-collection-name.enum';
import { FirestoreDataService } from 'src/app/services/firestore-data/firestore-data.service';
import { FsVersion } from 'src/app/services/firestore-data/firestore-document.interface';

@Component({
  selector: 'app-release-history',
  templateUrl: './release-history.component.html',
  styleUrls: ['./release-history.component.scss'],
})
export class ReleaseHistoryComponent implements OnInit {
  private readonly className = 'ReleaseHistoryComponent';

  private readonly recentHistoryNum = 3;

  private versions = this.firestore.getData(FsCollectionName.Versions) as FsVersion[];

  filteredVersions!: FsVersion[];

  recentVersions: FsVersion[] = [];

  oldVersions: FsVersion[] = [];

  recentVersionDates: string[] = [];

  oldVersionDates: string[] = [];

  createdDates: string[] = [];

  foldEnable: boolean = true;

  constructor(private logger: NGXLogger, private firestore: FirestoreDataService) {
    this.logger.trace(`new ${this.className}()`);
  }

  async ngOnInit(): Promise<void> {
    const location = `${this.className}.ngOnInit()`;
    this.logger.trace(location);

    await this.firestore.waitInit();

    // Sort version info.
    // * Descending order.
    this.versions.sort((a, b) => {
      return this.compareVersionNumber(a.name, b.name) * -1;
    });

    // Filter version.
    // Show version information only equal to or smaller than the current version.
    // (Hide scheduled version.)
    this.filteredVersions = this.versions.filter((item) => this.compareVersionNumber(AppInfo.version, item.name) >= 0);

    // Make recent version list and date text.
    for (let i = 0; i < this.recentHistoryNum; ++i) {
      if (this.filteredVersions.length > 0) {
        const v = this.filteredVersions.shift() as FsVersion;
        this.recentVersions.push(v);
        this.recentVersionDates.push(this.firestore.convTimestampToDate(v.createdAt).toLocaleDateString());
      }
    }

    // Make old version list and date text.
    if (this.filteredVersions.length === 0) {
      this.foldEnable = false;
    } else {
      this.foldEnable = true;
      this.oldVersions = this.filteredVersions;
      for (let i = 0; i < this.oldVersions.length; ++i) {
        const v = this.oldVersions[i];
        this.oldVersionDates.push(this.firestore.convTimestampToDate(v.createdAt).toLocaleDateString());
      }
    }
  }

  //============================================================================
  // Private methods.
  //
  //----------------------------------------------------------------------------
  // Version info recognition.
  //
  private compareVersionNumber(a: string, b: string): number {
    const splitA = a.split('.');
    const splitB = b.split('.');

    for (let i = 0; i < splitA.length; ++i) {
      if (splitB.length > i) {
        const numA = Number(splitA[i]);
        const numB = Number(splitB[i]);

        if (numA > numB) {
          return 1;
        } else if (numA < numB) {
          return -1;
        } else {
          // Same version. Do nothing.
        }
      } else {
        return 1;
      }
    }

    // If the program come here, it means whether
    // (A) A and B are completely same. e.g. '1.10.2' and '1.10.2'.
    // (B) B is longer than A. e.g. '1.10.2' and '1.10.2.4'
    if (splitA.length === splitB.length) {
      return 0;
    } else {
      return -1;
    }
  }
}
