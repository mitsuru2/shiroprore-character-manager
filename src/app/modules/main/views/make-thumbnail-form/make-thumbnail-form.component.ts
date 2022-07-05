import { AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { HtmlCanvas } from '../../utils/html-canvas/html-canvas.utility';
import { loadImageFile } from '../../utils/image-file/image-file.utility';
import { MakeThumbnailFormResult, XY } from './make-thumbnail-form.interface';

@Component({
  selector: 'app-make-thumbnail-form',
  templateUrl: './make-thumbnail-form.component.html',
  styleUrls: ['./make-thumbnail-form.component.scss'],
})
export class MakeThumbnailFormComponent implements OnChanges, AfterViewInit {
  readonly className = 'MakeThumbnailFormComponent';

  /** Status. */
  @Input() dialogMode: boolean = false;

  @Input() shown: boolean = false;

  /** Timer */
  timerId: any; // For interval timer control.

  /** Appearance. */
  @Input() styleClass = '';

  @Input() okLabel = 'OK';

  @Input() cancelLabel = 'Cancel';

  @Input() buttonStyleClass = '';

  /** Input image file. */
  @Input() inputFile!: File;

  inputImage?: any;

  /** Thumbnail and canvas size. */
  @Input() thumbSize = new XY(160, 160); // px.

  margin = new XY(50, 50);

  canvasSize = this.thumbSize.add(this.margin.multi(2));

  /** Image info. */
  imagePos = new XY();

  scaledImageSize = new XY();

  /** Canvas. */
  canvas?: HtmlCanvas;

  readonly canvasId = 'MakeThumbnailForm_Preview';

  /** Mouse */
  isMouseDragging = false;

  mouseLastPos: XY = new XY();

  /** Scale factor. */
  @Input() imageScale = 100;

  /** Output. */
  @Output() thumbResult = new EventEmitter<MakeThumbnailFormResult>();

  thumbData?: Blob;

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
  ngOnChanges(changes: SimpleChanges): void {
    const location = `${this.className}.ngOnChanges()`;

    // CASE: The shown flag is changed.
    // If it's in dialog mode, start interval to get canvas.
    if (changes['shown']) {
      this.logger.trace(location, 'shown', this.shown);
      const shownChange = changes['shown'];
      if (shownChange.previousValue === false && shownChange.currentValue === true) {
        if (this.dialogMode) {
          this.timerId = setInterval(() => {
            this.canvas = HtmlCanvas.createCanvas(this.canvasId);
            if (this.canvas) {
              clearInterval(this.timerId);
              this.initCanvas(this.canvas);
            } else {
              this.logger.info(location, 'Canvas is not ready.');
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
    if (changes['inputFile']) {
      this.logger.trace(location, 'inputFile');
      if (this.inputFile) {
        this.loadImage(this.inputFile);
      }
    }
  }

  /**
   * Lifecycle hook called on view is initialized.
   * If it is normal page (not dialog), canvas is available after view is initialized.
   */
  ngAfterViewInit(): void {
    if (!this.dialogMode) {
      this.canvas = HtmlCanvas.createCanvas(this.canvasId);
      if (this.canvas) {
        this.initCanvas(this.canvas);
      }
    }
  }

  /**
   * Event handler of the image scale input.
   * It calculate image position and image size after scaling.
   * @param event Number input event.
   */
  onImageScaleInputChange(event: any) {
    // Calculate image position.
    this.imagePos = this.calcScaledImagePos(event.value, this.scaledImageSize, this.imagePos);

    // Calculate scaled image size.
    this.scaledImageSize = this.calcScaledImageSize(event.value);

    if (this.inputImage) {
      this.draw();
    }
  }

  /**
   * OK button click event handler.
   * It makes thumbnail image and returns it to the parent component.
   */
  onOkClick() {
    const location = `${this.className}.onOkClick()`;
    this.logger.trace(location);

    this.MakeThumbnailFormData();

    this.thumbResult.emit({ canceled: false, thumb: this.thumbData });
  }

  /**
   * Cancel button click event handler.
   * It returns the canceled flag.
   */
  onCancelClick() {
    const location = `${this.className}.onCancelClick()`;
    this.logger.trace(location);

    this.thumbResult.emit({ canceled: true });
  }

  //============================================================================
  // Private methods.
  //
  //----------------------------------------------------------------------------
  // Set up functions.
  //
  private initCanvas(canvas: HtmlCanvas) {
    const location = `${this.className}.initCanvas()`;
    this.logger.trace(location);

    // Set canvas size.
    canvas.width = this.canvasSize.x;
    canvas.height = this.canvasSize.y;

    // Register event listener.
    canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    canvas.addEventListener('mouseout', this.onMouseOut.bind(this));
    canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    canvas.addEventListener('touchstart', this.onTouchStart.bind(this));
    canvas.addEventListener('touchend', this.onTouchEnd.bind(this));
    canvas.addEventListener('touchcancel', this.onTouchEnd.bind(this));
    canvas.addEventListener('touchmove', this.onTouchMove.bind(this));

    // Draw if image is also available.
    if (this.inputImage) {
      this.onImageScaleInputChange({ value: this.imageScale });
      this.draw();
    }
  }

  private loadImage(inputFile: File) {
    const promise = loadImageFile(inputFile);
    promise.then((result) => {
      this.inputImage = result;
      this.imagePos.x = (this.canvasSize.x - this.inputImage.width) / 2;
      this.scaledImageSize = this.calcScaledImageSize(100);
      if (this.canvas) {
        this.onImageScaleInputChange({ value: this.imageScale });
        this.draw();
      }
    });
  }

  //----------------------------------------------------------------------------
  // Drawing methods.
  //
  private draw() {
    if (this.canvas) {
      this.canvas.clear();
      this.drawImage();
      this.drawMarginFrame();
      this.drawCenterLine();
    }
  }

  private drawImage() {
    if (this.canvas) {
      this.canvas.drawImage(
        this.inputImage,
        this.imagePos.x,
        this.imagePos.y,
        this.scaledImageSize.x,
        this.scaledImageSize.y
      );
    }
  }

  /**
   * Fill margin area with transparent color.
   * Margin area is separated four rectangles like below.
   * +-----------------+
   * |        1        |
   * +---+---------+---+
   * |   |         |   |
   * | 2 |         | 3 |
   * |   |         |   |
   * +---+---------+---+
   * |        4        |
   * +-----------------+
   */
  private drawMarginFrame() {
    if (this.canvas) {
      this.canvas.fillStyle = 'rgba(128, 128, 128, 0.5)'; // 50% gray.
      this.canvas.drawRect(0, 0, this.canvasSize.x, this.margin.y);
      this.canvas.drawRect(0, this.margin.y, this.margin.x, this.canvasSize.y - this.margin.y * 2);
      this.canvas.drawRect(this.canvasSize.x - this.margin.x, this.margin.y, this.margin.x, this.canvasSize.y - this.margin.y * 2); // eslint-disable-line
      this.canvas.drawRect(0, this.canvasSize.y - this.margin.y, this.canvasSize.x, this.margin.y);
    }
  }

  private drawCenterLine() {
    if (this.canvas) {
      this.canvas.strokeStyle = 'rgba(0, 0, 255, 0.5)'; // 50% Blue.
      this.canvas.drawLine(0, Math.ceil(this.canvasSize.y / 2), this.canvasSize.x, Math.ceil(this.canvasSize.y / 2));
      this.canvas.drawLine(Math.ceil(this.canvasSize.x / 2), 0, Math.ceil(this.canvasSize.x / 2), this.canvasSize.y);
    }
  }

  //----------------------------------------------------------------------------
  // Mouse event handlers.
  //
  private getMousePos(event: MouseEvent | Touch): XY {
    return new XY(event.clientX, event.clientY);
  }

  private moveImage(event: MouseEvent | Touch) {
    // Get current mouse position (relative).
    const curPos = this.getMousePos(event);

    // Move image.
    const move = curPos.sub(this.mouseLastPos);
    this.imagePos = this.imagePos.add(move);

    // Update last position.
    this.mouseLastPos = curPos;
  }

  private onMouseDown(event: MouseEvent) {
    this.isMouseDragging = true;
    this.mouseLastPos = this.getMousePos(event);
  }

  private onMouseUp() {
    this.isMouseDragging = false;
  }

  private onMouseOut() {
    this.isMouseDragging = false;
  }

  private onMouseMove(event: MouseEvent) {
    if (this.isMouseDragging) {
      this.moveImage(event);
      this.draw();
    }
  }

  private onTouchStart(event: TouchEvent) {
    // It supports single touch only.
    if (event.changedTouches.length === 1) {
      this.isMouseDragging = true;
      this.mouseLastPos = this.getMousePos(event.changedTouches[0]);
    }
  }

  private onTouchEnd(event: TouchEvent) {
    // It suppots single touch only.
    if (event.changedTouches.length === 1) {
      this.isMouseDragging = false;
    }
  }

  private onTouchMove(event: TouchEvent) {
    if (event.changedTouches.length === 1) {
      if (this.isMouseDragging) {
        this.moveImage(event.changedTouches[0]);
        this.draw();
      }
    }
  }

  //----------------------------------------------------------------------------
  // Image scaling.
  //
  private calcScaledImageSize(scale: number): XY {
    const width = Math.ceil((this.inputImage.width * scale) / 100);
    const height = Math.ceil((this.inputImage.height * scale) / 100);

    return new XY(width, height);
  }

  private calcScaledImagePos(scale: number, size: XY, pos: XY): XY {
    const center = this.canvasSize.div(2).sub(pos);
    const rate = new XY(center.x / size.x, center.y / size.y);
    const scaledWH = this.calcScaledImageSize(scale);
    const scaledCenter = new XY(scaledWH.x * rate.x, scaledWH.y * rate.y);
    return this.canvasSize.div(2).sub(scaledCenter);
  }

  //----------------------------------------------------------------------------
  // Making output data.
  //
  private MakeThumbnailFormData() {
    const location = `${this.className}.MakeThumbnailFormData()`;

    // Make dummy canvas to crop image.
    const tmpCanvas = document.createElement('canvas');
    if (!tmpCanvas) {
      this.logger.error(location, 'Temporary canvas is not available.');
      return;
    }
    const context = tmpCanvas.getContext('2d');
    if (!context) {
      this.logger.error(location, 'Context is not avaiable.');
      return;
    }

    // Set temporary canvas size.
    tmpCanvas.width = this.thumbSize.x;
    tmpCanvas.height = this.thumbSize.y;

    // Fill canvas with white color.
    context.fillStyle = 'rgba(255, 255, 255, 1)';
    context.fillRect(0, 0, tmpCanvas.width, tmpCanvas.height);

    // Draw image to temporary canvas.
    const pos = this.imagePos.sub(this.margin);
    context.drawImage(this.inputImage, pos.x, pos.y, this.scaledImageSize.x, this.scaledImageSize.y);

    // Get image data.
    const base64 = tmpCanvas.toDataURL('image/jpeg');
    const bin = atob(base64.split('base64,')[1]);
    let binaryData = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; ++i) {
      binaryData[i] = bin.charCodeAt(i);
    }

    this.thumbData = new Blob([binaryData], { type: 'image/jpeg' });
    return;
  }
}
