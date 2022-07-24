import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { AppInfo } from 'src/app/app-info.enum';
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

  appInfo = AppInfo;

  loaded = false;

  constructor(
    private logger: NGXLogger,
    private errorHandler: ErrorHandlerService,
    private router: Router,
    private firestore: FirestoreDataService
  ) {
    this.logger.trace(`new ${this.className}()`);
  }

  async ngOnInit(): Promise<void> {
    const location = `${this.className}.ngOnInit()`;
    this.logger.trace(location);

    // Wait until that the firestore data loading will be finished.
    this.waitFirestoreDataLoading();
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
}
