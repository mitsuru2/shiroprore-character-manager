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

    // Make recent version list.
    for (let i = 0; i < this.recentHistoryNum; ++i) {
      if (this.filteredVersions.length > 0) {
        this.recentVersions.push(this.filteredVersions.shift() as FsVersion);
      }
    }

    // Make old version list.
    if (this.filteredVersions.length === 0) {
      this.foldEnable = false;
    } else {
      this.foldEnable = true;
      this.oldVersions = this.filteredVersions;
    }

    // Make date text.
    for (let i = 0; i < this.filteredVersions.length; ++i) {
      // this.logger.debug(location, { seconds: (this.filteredVersions[i].createdAt as Timestamp).seconds });
      const date = this.firestore.convTimestampToDate(this.filteredVersions[i].createdAt);
      this.createdDates.push(date.toLocaleDateString());
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
