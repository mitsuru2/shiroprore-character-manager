import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { AppInfo } from 'src/app/app-info.enum';
import { FsCollectionName } from 'src/app/services/firestore-data/firestore-collection-name.enum';
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

  constructor(private logger: NGXLogger, private firestore: FirestoreDataService, private router: Router) {
    this.logger.trace(`new ${this.className}()`);
  }

  async ngOnInit(): Promise<void> {
    const location = `${this.className}.ngOnInit()`;
    this.logger.trace(location);

    try {
      await Promise.all([
        this.firestore.load(FsCollectionName.Abilities),
        this.firestore.load(FsCollectionName.AbilityTypes),
        this.firestore.load(FsCollectionName.CharacterTags),
        this.firestore.load(FsCollectionName.CharacterTypes),
        this.firestore.load(FsCollectionName.Characters),
        this.firestore.load(FsCollectionName.Facilities),
        this.firestore.load(FsCollectionName.FacilityTypes),
        this.firestore.load(FsCollectionName.Regions),
        this.firestore.load(FsCollectionName.GeographTypes),
        this.firestore.load(FsCollectionName.VoiceActors),
        this.firestore.load(FsCollectionName.Illustrators),
        this.firestore.load(FsCollectionName.Weapons),
        this.firestore.load(FsCollectionName.WeaponTypes),
      ]);
      this.logger.info(location, 'Firestore data loading finished.');
      this.loaded = true;
    } catch {
      this.logger.error(location, 'Firestore data loading failed.');
    }
  }

  goToMain() {
    const location = `${this.className}.goToMain()`;
    this.logger.trace(location);

    this.router.navigateByUrl('/main');
  }
}
