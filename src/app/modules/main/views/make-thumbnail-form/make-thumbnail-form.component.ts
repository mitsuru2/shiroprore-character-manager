import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { ErrorCode } from 'src/app/services/error-handler/error-code.enum';
import { ErrorHandlerService } from 'src/app/services/error-handler/error-handler.service';
import { HtmlCanvas } from '../../utils/html-canvas/html-canvas.utility';
import { loadImageFile } from '../../utils/image-file/image-file.utility';
import { sleep } from '../../utils/sleep/sleep.utility';
import { ThumbnailMakeInfo, XY } from './make-thumbnail-form.interface';

@Component({
  selector: 'app-make-thumbnail-form',
  templateUrl: './make-thumbnail-form.component.html',
  styleUrls: ['./make-thumbnail-form.component.scss'],
})
export class MakeThumbnailFormComponent implements OnInit, AfterViewInit {
  readonly className = 'MakeThumbnailFormComponent';

  /** Appearance. */
  @Input() styleClass = '';

  @Input() okLabel = 'OK';

  @Input() cancelLabel = 'Cancel';

  @Input() buttonStyleClass = '';

  /** Form result. */
  @Input() thumbMakeInfo!: ThumbnailMakeInfo;

  @Output() thumbMakeInfoChange = new EventEmitter<ThumbnailMakeInfo>();

  @Output() canceled = new EventEmitter<boolean>();

  /** Input image work. */
  inputImage?: any;

  /** Thumbnail and canvas size. */
  thumbSize!: XY; // Initialized at ngOnInit()

  readonly margin = new XY(20, 20);

  canvasSize!: XY; // Initialized at ngOnInit()

  readonly scaleRate = 0.125; // Draw scale line at 10%.

  /** Image info. */
  imagePos!: XY; // Initialized at ngOnInit()

  scaledImageSize = new XY();

  /** Canvas. */
  canvas!: HtmlCanvas;

  readonly canvasId = 'MakeThumbnailForm_Preview';

  /** Mouse */
  isMouseDragging = false;

  mouseLastPos: XY = new XY();

  /** Scale factor. */
  imageScale!: number; // Initialized at ngOnInit()

  //============================================================================
  // Class methods.
  //
  /**
   * Constructor. Nothing to do.
   * @param logger NGX logger instance injection.
   */
  constructor(private logger: NGXLogger, private errorHandler: ErrorHandlerService) {
    this.logger.trace(`new ${this.className}()`);
  }

  ngOnInit(): void {
    const location = `${this.className}.ngOnInit()`;
    this.logger.trace(location, {
      ofsX: this.thumbMakeInfo.offset.x,
      ofsY: this.thumbMakeInfo.offset.y,
      scale: this.thumbMakeInfo.scale,
    });

    // Initialize member variables from input parameter
    this.thumbSize = this.thumbMakeInfo.imageSize;
    this.canvasSize = this.thumbSize.add(this.margin.multi(2));
    this.imagePos = this.thumbMakeInfo.offset;
    this.imageScale = this.thumbMakeInfo.scale;
  }

  /**
   * Lifecycle hook called on view is initialized.
   * If it is normal page (not dialog), canvas is available after view is initialized.
   */
  async ngAfterViewInit(): Promise<void> {
    const location = `${this.className}.ngAfterViewInit()`;
    this.logger.trace(location);

    // Get canvas element.
    try {
      await sleep(100);
      this.canvas = new HtmlCanvas(this.canvasId);
      this.initCanvas(this.canvas);
    } catch (error) {
      this.errorHandler.notifyError(error);
    }

    // Load image file.
    this.loadImage(this.thumbMakeInfo.image);
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

    try {
      this.thumbMakeInfo.thumb = this.MakeThumbnailImageData();
      this.thumbMakeInfo.offset = this.imagePos;
      this.thumbMakeInfo.scale = this.imageScale;
    } catch (error) {
      this.errorHandler.notifyError(error);
    }

    this.thumbMakeInfoChange.emit(this.thumbMakeInfo);
    this.canceled.emit(false);
  }

  /**
   * Cancel button click event handler.
   * It returns the canceled flag.
   */
  onCancelClick() {
    const location = `${this.className}.onCancelClick()`;
    this.logger.trace(location);
    this.canceled.emit(true);
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

  private async loadImage(inputFile: Blob) {
    // Load image.
    const result = await loadImageFile(inputFile);
    this.inputImage = result;
    if (this.imagePos.x === 0 && this.imagePos.y === 0) {
      this.imagePos.x = (this.canvasSize.x - this.inputImage.width) / 2;
      this.imagePos.y = (this.canvasSize.y - this.inputImage.height) / 2;
      this.scaledImageSize = this.calcScaledImageSize(100);
    } else {
      this.scaledImageSize = this.calcScaledImageSize(this.imageScale);
    }

    // Draw image.
    this.onImageScaleInputChange({ value: this.imageScale });
    this.draw();
  }

  //----------------------------------------------------------------------------
  // Drawing methods.
  //
  private draw() {
    this.canvas.clear();
    this.drawImage();
    this.drawMarginFrame();
    this.drawCenterLine();
    this.drawScaleLine();
  }

  private drawImage() {
    this.canvas.drawImage(
      this.inputImage,
      this.imagePos.x,
      this.imagePos.y,
      this.scaledImageSize.x,
      this.scaledImageSize.y
    );
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
    this.canvas.fillStyle = 'rgba(128, 128, 128, 0.5)'; // 50% gray.
    this.canvas.drawRect(0, 0, this.canvasSize.x, this.margin.y);
    this.canvas.drawRect(0, this.margin.y, this.margin.x, this.canvasSize.y - this.margin.y * 2);
    this.canvas.drawRect(this.canvasSize.x - this.margin.x, this.margin.y, this.margin.x, this.canvasSize.y - this.margin.y * 2); // eslint-disable-line
    this.canvas.drawRect(0, this.canvasSize.y - this.margin.y, this.canvasSize.x, this.margin.y);
  }

  private drawCenterLine() {
    this.canvas.strokeStyle = 'rgba(0, 0, 255, 0.5)'; // 50% Blue.
    this.canvas.drawLine(0, Math.ceil(this.canvasSize.y / 2), this.canvasSize.x, Math.ceil(this.canvasSize.y / 2));
    this.canvas.drawLine(Math.ceil(this.canvasSize.x / 2), 0, Math.ceil(this.canvasSize.x / 2), this.canvasSize.y);
  }

  private drawScaleLine() {
    this.canvas.strokeStyle = 'rgba(0, 0, 255, 0.5)'; // 50% Blue.
    this.canvas.drawLine(
      Math.ceil(this.canvasSize.x / 2 - 5),
      Math.ceil(this.thumbSize.y * this.scaleRate + this.margin.y),
      Math.ceil(this.canvasSize.x / 2 + 5),
      Math.ceil(this.thumbSize.y * this.scaleRate + this.margin.y)
    );
    this.canvas.drawLine(
      Math.ceil(this.canvasSize.x / 2 - 5),
      Math.ceil(this.thumbSize.y * (1.0 - this.scaleRate) + this.margin.y),
      Math.ceil(this.canvasSize.x / 2 + 5),
      Math.ceil(this.thumbSize.y * (1.0 - this.scaleRate) + this.margin.y)
    );
    this.canvas.drawLine(
      Math.ceil(this.thumbSize.x * this.scaleRate + this.margin.x),
      Math.ceil(this.canvasSize.y / 2 - 5),
      Math.ceil(this.thumbSize.x * this.scaleRate + this.margin.x),
      Math.ceil(this.canvasSize.y / 2 + 5)
    );
    this.canvas.drawLine(
      Math.ceil(this.thumbSize.x * (1.0 - this.scaleRate) + this.margin.x),
      Math.ceil(this.canvasSize.y / 2 - 5),
      Math.ceil(this.thumbSize.x * (1.0 - this.scaleRate) + this.margin.x),
      Math.ceil(this.canvasSize.y / 2 + 5)
    );
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
  private MakeThumbnailImageData(): Blob {
    const location = `${this.className}.MakeThumbnailImageData()`;

    // Make dummy canvas to crop image.
    const tmpCanvas = document.createElement('canvas');
    if (!tmpCanvas) {
      const error = new Error(`${location} Temporary canvas creation failed.`);
      error.name = ErrorCode.Unexpected;
      throw error;
    }
    const context = tmpCanvas.getContext('2d');
    if (!context) {
      const error = new Error(`${location} Temporary canvas context is not available.`);
      error.name = ErrorCode.Unexpected;
      throw error;
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

    return new Blob([binaryData], { type: 'image/jpeg' });
  }
}
