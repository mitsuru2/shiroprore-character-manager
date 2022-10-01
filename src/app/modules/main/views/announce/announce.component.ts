import { Component, OnInit } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { FsCollectionName } from 'src/app/services/firestore-data/firestore-collection-name.enum';
import { FirestoreDataService } from 'src/app/services/firestore-data/firestore-data.service';
import { FsAnnounce } from 'src/app/services/firestore-data/firestore-document.interface';

@Component({
  selector: 'app-announce',
  templateUrl: './announce.component.html',
  styleUrls: ['./announce.component.scss'],
})
export class AnnounceComponent implements OnInit {
  readonly className = 'AnnounceComponent';

  readonly interval = 200; // ms.

  announce: FsAnnounce = new FsAnnounce();

  constructor(private logger: NGXLogger, private firestore: FirestoreDataService) {
    this.logger.trace(`new ${this.className}()`);
  }

  async ngOnInit(): Promise<void> {
    const location = `${this.className}.ngOnInit()`;
    this.logger.trace(location);

    await this.firestore.waitInit();

    this.announce = this.firestore.getData(FsCollectionName.Announces)[0] as FsAnnounce;
  }

  //============================================================================
  // Private methods.
  //
  //----------------------------------------------------------------------------
  // Initialization.
  //
  private waitFirestoreDataLoading() {
    const timer = setInterval(() => {
      if (this.firestore.loaded) {
        clearInterval(timer);
      }
    }, this.interval);
  }
}
