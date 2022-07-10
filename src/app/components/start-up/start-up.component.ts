import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { AppInfo } from 'src/app/app-info.enum';
import { FirestoreDataService } from 'src/app/services/firestore-data/firestore-data.service';

@Component({
  selector: 'app-start-up',
  templateUrl: './start-up.component.html',
  styleUrls: ['./start-up.component.scss'],
})
export class StartUpComponent implements OnInit {
  appInfo = AppInfo;

  loaded = false;

  readonly className = 'StartUpComponent';

  constructor(private logger: NGXLogger, private router: Router, private firestore: FirestoreDataService) {
    this.logger.trace(`new ${this.className}()`);
  }

  async ngOnInit(): Promise<void> {
    const location = `${this.className}.ngOnInit()`;
    this.logger.trace(location);

    const timer = setInterval(() => {
      if (this.firestore.loaded) {
        this.loaded = true;
        clearInterval(timer);
      }
    }, 200);
  }

  goToMain() {
    const location = `${this.className}.goToMain()`;
    this.logger.trace(location);

    this.router.navigateByUrl('/main');
  }
}
