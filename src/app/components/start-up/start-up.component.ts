import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { AppInfo } from 'src/app/app-info.enum';
import { CloudStorageService } from 'src/app/services/cloud-storage/cloud-storage.service';
import { ErrorHandlerService } from 'src/app/services/error-handler/error-handler.service';
import { FirestoreDataService } from 'src/app/services/firestore-data/firestore-data.service';

@Component({
  selector: 'app-start-up',
  templateUrl: './start-up.component.html',
  styleUrls: ['./start-up.component.scss'],
})
export class StartUpComponent implements OnInit {
  readonly className = 'StartUpComponent';

  readonly interval = 200; // ms.

  readonly loadThumbNum = 50;

  appInfo = AppInfo;

  loaded = false;

  constructor(
    private logger: NGXLogger,
    private errorHandler: ErrorHandlerService,
    private router: Router,
    private firestore: FirestoreDataService,
    private storage: CloudStorageService
  ) {
    this.logger.trace(`new ${this.className}()`);
  }

  async ngOnInit(): Promise<void> {
    const location = `${this.className}.ngOnInit()`;
    this.logger.trace(location);

    // Load thumbnail images.
    await this.loadThumbnailImages();
    this.logger.info(location, 'Thumbnail images are loaded.');

    // Wait until that the firestore data loading will be finished.
    await this.firestore.waitInit();
    this.loaded = true;
  }

  goToMain() {
    const location = `${this.className}.goToMain()`;
    this.logger.trace(location);

    this.router.navigateByUrl('/main');
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
        this.loaded = true;
        clearInterval(timer);
      }
    }, this.interval);
  }

  private async loadThumbnailImages(): Promise<void> {
    let promises: Promise<Blob>[] = [];

    for (let i = 0; i < this.loadThumbNum; ++i) {
      const path = this.storage.makeCharacterThumbnailPath(`10-00-${i.toString(16).padStart(4, '0')}`);
      promises.push(this.storage.get(path));
    }
    await Promise.all(promises);
  }
}
