import { AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { CsCharacterImageTypeMax } from 'src/app/services/cloud-storage/cloud-storage.interface';
import { HtmlCanvas } from '../../utils/html-canvas/html-canvas.utility';
import { loadImageFile } from '../../utils/image-file/image-file.utility';
import { NewCharacterFormContent } from '../new-character-form/new-character-form.interface';

@Component({
  selector: 'app-new-character-confirmation',
  templateUrl: './new-character-confirmation.component.html',
  styleUrls: ['./new-character-confirmation.component.scss'],
})
export class NewCharacterConfirmationComponent implements OnChanges, AfterViewInit {
  private className = 'NewCharacterConfirmationComponent';

  /** Status */
  @Input() dialogMode: boolean = false;

  @Input() shown: boolean = false;

  /** Timer */
  timerId: any; // For interval timer control.

  /** Appearance */
  @Input() styleClass = '';

  @Input() okLabel = 'OK';

  @Input() cancelLabel = 'Cancel';

  @Input() buttonStyleClass = '';

  readonly textNotAvailable = '(n.a.)';

  readonly previewCanvasWidth = '160px';

  readonly previewCanvasHeight = this.previewCanvasWidth;

  /** Character data. */
  @Input() character!: NewCharacterFormContent;

  /** Images. */
  images: HTMLImageElement[] = new Array(CsCharacterImageTypeMax);

  imagesKai: HTMLImageElement[] = new Array(CsCharacterImageTypeMax);

  thumbnailImage?: HTMLImageElement;

  imagesLoaded = false;

  /** Canvas */
  canvases: HtmlCanvas[] = [];

  canvasesKai: HtmlCanvas[] = [];

  thumbnailCanvas?: HtmlCanvas;

  canvasesReady = false;

  /** Result */
  @Output() confirmationResult = new EventEmitter<boolean>();

  //============================================================================
  // Class methods.
  //
  /**
   * Constructor. Nothing to do.
   * @param logger NGX logger instance injection.
   */
  constructor(private logger: NGXLogger) {
    this.logger.trace(`new ${this.className}()`);
  }

  /**
   * Lifecycle hook called on input parameter changes.
   * (1) Under the dialog mode, it init canvas element after the dialog is shown.
   * (2) It loads input image.
   * @param changes Change information of input parameters.
   */
  async ngOnChanges(changes: SimpleChanges) {
    const location = `${this.className}.ngOnChanges()`;

    // CASE: The shown flag is changed.
    // If it's in dialog mode, start interval to get canvas.
    if (changes['shown']) {
      this.logger.trace(location, 'shown', this.shown);
      const shownChange = changes['shown'];
      this.canvasesReady = false;

      if (shownChange.previousValue === false && shownChange.currentValue === true) {
        if (this.dialogMode) {
          this.timerId = setInterval(() => {
            this.logger.debug(location, { canvas: this.canvasesReady, image: this.imagesLoaded });

            // Get canvas.
            if (!this.canvasesReady) {
              this.getAllCanvases();
            }

            // Draw images.
            if (this.canvasesReady && this.imagesLoaded) {
              this.drawAllImages();
              clearInterval(this.timerId);
            }
          }, 200);
        }
      }
      if (shownChange.previousValue === true && shownChange.currentValue === false) {
        clearInterval(this.timerId);
      }
    }

    // CASE: The source image file is changed.
    // It load input source image.
    if (changes['character']) {
      this.logger.trace(location, 'character');

      // Load image files.
      this.loadAllImages();
    }
  }

  async ngAfterViewInit() {
    const location = `${this.className}.ngAfterViewInit()`;
    this.logger.trace(location);

    if (!this.dialogMode) {
      await this.loadAllImages();
      this.getAllCanvases();
      this.drawAllImages();
    }
  }

  onOkClick() {
    const location = `${this.className}.onOkClick()`;
    this.logger.trace(location);
    this.confirmationResult.emit(true);
  }

  onCancelClick() {
    const location = `${this.className}.onCancelClick()`;
    this.logger.trace(location);
    this.confirmationResult.emit(false);
  }

  //============================================================================
  // Private methods.
  //
  //----------------------------------------------------------------------------
  // Image drawing.
  //
  private async loadAllImages() {
    const location = `${this.className}.loadAllImages()`;

    this.imagesLoaded = false;
    this.logger.debug(location, 'start');

    for (let i = 0; i < this.images.length; ++i) {
      if (this.character.imageFiles[i]) {
        this.logger.debug(location, `images[${i}]`);
        this.images[i] = await loadImageFile(this.character.imageFiles[i]);
      }
    }
    if (this.character.thumbnailImage) {
      this.logger.debug(location, `thumbnail`);
      this.thumbnailImage = await loadImageFile(this.character.thumbnailImage);
    }
    for (let i = 0; i < this.imagesKai.length; ++i) {
      if (this.character.imageFilesKai[i]) {
        this.logger.debug(location, `imagesKai[${i}]`);
        this.imagesKai[i] = await loadImageFile(this.character.imageFilesKai[i]);
      }
    }
    this.imagesLoaded = true;
    this.logger.debug(location, 'end');
  }

  private getAllCanvases() {
    let elemId = '';
    let tmp: any;

    this.canvasesReady = false;

    for (let i = 0; i < this.images.length; ++i) {
      elemId = 'NewCharacterConfirmation_ImagePreview_' + i;
      tmp = HtmlCanvas.createCanvas(elemId);
      if (tmp) {
        this.canvases[i] = tmp;
      } else {
        return;
      }
    }

    elemId = 'NewCharacterConfirmation_ThumbnailPreview';
    tmp = HtmlCanvas.createCanvas(elemId);
    if (tmp) {
      this.thumbnailCanvas = tmp;
    } else {
      return;
    }

    for (let i = 0; i < this.imagesKai.length; ++i) {
      elemId = 'NewCharacterConfirmation_ImagePreviewKai_' + i;
      tmp = HtmlCanvas.createCanvas(elemId);
      if (tmp) {
        this.canvasesKai[i] = tmp;
      } else {
        return;
      }
    }

    this.canvasesReady = true;
  }

  private drawAllImages() {
    const location = `${this.className}.drawAllImages()`;

    let offsetX = 0;

    for (let i = 0; i < this.images.length; ++i) {
      if (this.images[i]) {
        this.logger.debug(location, `images[${i}]`);
        this.canvases[i].width = this.images[i].height;
        this.canvases[i].height = this.images[i].height;
        offsetX = (this.images[i].height - this.images[i].width) / 2;
        this.canvases[i].drawImage(this.images[i], offsetX, 0);
      }
    }
    if (this.character.thumbnailImage) {
      if (this.thumbnailCanvas && this.thumbnailImage) {
        this.logger.debug(location, `thumbnail`);
        this.thumbnailCanvas.width = this.thumbnailImage.width;
        this.thumbnailCanvas.height = this.thumbnailImage.height;
        this.thumbnailCanvas.drawImage(this.thumbnailImage, 0, 0);
      }
    }
    for (let i = 0; i < this.imagesKai.length; ++i) {
      if (this.imagesKai[i]) {
        this.logger.debug(location, `imagesKai[${i}]`);
        this.canvasesKai[i].width = this.imagesKai[i].height;
        this.canvasesKai[i].height = this.imagesKai[i].height;
        offsetX = (this.imagesKai[i].height - this.imagesKai[i].width) / 2;
        this.canvasesKai[i].drawImage(this.imagesKai[i], offsetX, 0);
      }
    }
  }
}
