import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { CsCharacterImageTypeMax, csCharacterImageTypes } from 'src/app/services/cloud-storage/cloud-storage.interface';
import { CloudStorageService } from 'src/app/services/cloud-storage/cloud-storage.service';
import { ErrorCode } from 'src/app/services/error-handler/error-code.enum';
import { ErrorHandlerService } from 'src/app/services/error-handler/error-handler.service';
import { FsCollectionName } from 'src/app/services/firestore-data/firestore-collection-name.enum';
import { FirestoreDataService } from 'src/app/services/firestore-data/firestore-data.service';
import { FsCharacter } from 'src/app/services/firestore-data/firestore-document.interface';
import { HtmlCanvas } from '../../utils/html-canvas/html-canvas.utility';

class CharacterImage {
  url = '';

  data: Blob = new Blob();

  valid = false;
}

@Component({
  selector: 'app-character',
  templateUrl: './character.component.html',
  styleUrls: ['./character.component.scss'],
})
export class CharacterComponent implements OnInit, AfterViewInit {
  readonly className = 'CharacterComponent';

  id = ''; // Character ID from URL paramter.

  character = new FsCharacter();

  selectedImageType = csCharacterImageTypes[0];

  images: CharacterImage[] = [];

  //============================================================================
  // Class methods.
  //
  constructor(
    private logger: NGXLogger,
    private firestore: FirestoreDataService,
    private storage: CloudStorageService,
    private route: ActivatedRoute,
    private errorHandler: ErrorHandlerService
  ) {
    this.logger.trace(`new ${this.className}()`);

    this.images = [];
    for (let i = 0; i < CsCharacterImageTypeMax; ++i) {
      this.images.push(new CharacterImage());
    }
  }

  ngOnInit(): void {
    // Get character ID from URL.
    const tmpId = this.route.snapshot.paramMap.get('id');
    if (tmpId) {
      this.id = tmpId;
    } else {
      this.errorHandler.notifyError(ErrorCode.NotFound, 'No character ID.');
    }
  }

  async ngAfterViewInit(): Promise<void> {
    const location = `${this.className}.ngAfterViewInit()`;
    this.logger.trace(location);

    // Load data if data loading is not finished.
    // Basically, this process is not needed. It's needed when user type URL directly.
    if (!this.firestore.loaded) {
      await this.firestore.loadAll();
    }

    // Get character information by character ID.
    const tmpCharacter = this.firestore.getDataById(FsCollectionName.Characters, this.id);
    if (tmpCharacter) {
      this.character = tmpCharacter;
    } else {
      this.errorHandler.notifyError(ErrorCode.NotFound, `Invalid character ID: ${this.id}`);
    }

    // Start loading of character images.
    for (let i = 0; i < csCharacterImageTypes.length; ++i) {
      const path = this.storage.makeCharacterImagePath(this.character.index, csCharacterImageTypes[i].type);
      const data = await this.storage.get(path);
      if (data) {
        this.images[i].data = data;
        this.images[i].url = window.URL.createObjectURL(this.images[i].data);
        this.images[i].valid = true;

        // Draw 1st image.
        if (i === 0) {
          this.updateImage();
        }
      } else {
        this.images[i].valid = false;
      }
    }
  }

  //============================================================================
  // Private methods.
  //
  private updateImage() {
    const location = `${this.className}.updateImage()`;

    const iType = csCharacterImageTypes.findIndex((item) => item.type === this.selectedImageType.type);
    const imageElement = document.getElementById('Character_ImagePreview') as HTMLImageElement;

    this.logger.debug(location, this.images[iType]);
    imageElement.src = this.images[iType].url;
  }
}
