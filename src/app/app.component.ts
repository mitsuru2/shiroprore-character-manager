import { Component } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { FirestoreDataService } from './services/firestore-data/firestore-data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent /*implements OnInit*/ {
  readonly className = 'AppComponent';

  constructor(private logger: NGXLogger, private firestore: FirestoreDataService) {
    this.logger.trace(`new ${this.className}()`);
  }

  // ngOnInit(): void {}
}
