import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { CsCharacterImageTypeMax } from 'src/app/services/cloud-storage/cloud-storage.interface';
import { HtmlCanvas } from '../../utils/html-canvas/html-canvas.utility';
import { loadImageFile } from '../../utils/image-file/image-file.utility';
import { sleep } from '../../utils/sleep/sleep.utility';
import { NewCharacterFormData } from '../new-character-form/new-character-form.interface';

@Component({
  selector: 'app-new-character-confirmation',
  templateUrl: './new-character-confirmation.component.html',
  styleUrls: ['./new-character-confirmation.component.scss'],
})
export class NewCharacterConfirmationComponent implements AfterViewInit {
  private readonly className = 'NewCharacterConfirmationComponent';

  /** Appearance */
  @Input() styleClass = '';

  @Input() okLabel = 'OK';

  @Input() cancelLabel = 'Cancel';

  @Input() buttonStyleClass = '';

  readonly textNotAvailable = '(n.a.)';

  readonly imagePreviewW = 160;

  readonly imagePreviewH = this.imagePreviewW;

  /** Character data. */
  @Input() character!: NewCharacterFormData;

  /** Images. */
  images: HTMLImageElement[] = new Array(CsCharacterImageTypeMax);

  imagesKai: HTMLImageElement[] = new Array(CsCharacterImageTypeMax);

  thumbnailImage?: HTMLImageElement;

  imagesLoaded = false;

  /** Result */
  @Output() canceled = new EventEmitter<boolean>();

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

  async ngAfterViewInit() {
    const location = `${this.className}.ngAfterViewInit()`;
    this.logger.trace(location);

    await sleep(10);
    await this.loadAllImages();
    this.drawAllImages();
    this.imagesLoaded = true;
  }

  onOkClick() {
    const location = `${this.className}.onOkClick()`;
    this.logger.trace(location);
    this.canceled.emit(false);
  }

  onCancelClick() {
    const location = `${this.className}.onCancelClick()`;
    this.logger.trace(location);
    this.canceled.emit(true);
  }

  //============================================================================
  // Private methods.
  //
  //----------------------------------------------------------------------------
  // Image drawing.
  //
  private async loadAllImages() {
    const location = `${this.className}.loadAllImages()`;

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
  }

  private drawAllImages() {
    // const location = `${this.className}.drawAllImages()`;

    let canvas: HtmlCanvas;
    let offsetX = 0;

    for (let i = 0; i < this.images.length; ++i) {
      if (this.images[i]) {
        canvas = new HtmlCanvas(`NewCharacterConfirmation_ImagePreview_${i}`);
        canvas.width = this.images[i].height;
        canvas.height = this.images[i].height;
        offsetX = (this.images[i].height - this.images[i].width) / 2;
        canvas.drawImage(this.images[i], offsetX, 0);
      }
    }
    if (this.character.thumbnailImage) {
      if (this.thumbnailImage) {
        canvas = new HtmlCanvas(`NewCharacterConfirmation_ThumbnailPreview`);
        canvas.width = this.thumbnailImage.width;
        canvas.height = this.thumbnailImage.height;
        canvas.drawImage(this.thumbnailImage, 0, 0);
      }
    }
    for (let i = 0; i < this.imagesKai.length; ++i) {
      if (this.imagesKai[i]) {
        canvas = new HtmlCanvas(`NewCharacterConfirmation_ImagePreviewKai_${i}`);
        canvas.width = this.images[i].height;
        canvas.height = this.images[i].height;
        offsetX = (this.images[i].height - this.images[i].width) / 2;
        canvas.drawImage(this.images[i], offsetX, 0);
      }
    }
  }
}
