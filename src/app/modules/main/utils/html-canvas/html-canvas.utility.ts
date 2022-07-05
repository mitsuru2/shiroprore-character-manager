import { Point2D } from './html-canvas.interface';

export class HtmlCanvas {
  className: string = 'HtmlCanvas';

  /** Canvas */
  canvas?: HTMLCanvasElement;

  /** Context */
  context?: CanvasRenderingContext2D;

  //============================================================================
  // Class methods.
  //
  // constructor() {}

  static createCanvas(canvasId: string): HtmlCanvas | undefined {
    // Get canvas.
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) {
      return undefined;
    }

    // Get context.
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    if (!context) {
      return undefined;
    }

    const canvasClass = new HtmlCanvas();
    canvasClass.canvas = canvas;
    canvasClass.context = context;
    return canvasClass;
  }

  drawImage(image: HTMLImageElement, dx: number, dy: number, dw?: number, dh?: number) {
    const location = `${this.className}.drawImage()`;

    // Check context.
    if (!this.context) {
      throw Error(`${location} Canvas is not initialized.`);
    }

    // Draw image.
    if (!dw || !dh) {
      this.context.drawImage(image, dx, dy);
    } else {
      this.context.drawImage(image, dx, dy, dw, dh);
    }
  }

  drawRect(x: number, y: number, w: number, h: number) {
    const location = `${this.className}.drawRect()`;

    // Check context.
    if (!this.context) {
      throw Error(`${location} Canvas is not initialized.`);
    }

    // Fill rectangle.
    this.context.fillRect(x, y, w, h);
  }

  drawLine(sx: number, sy: number, dx: number, dy: number) {
    const location = `${this.className}.drawLine()`;

    // Check context.
    if (!this.context) {
      throw Error(`${location} Canvas is not initialized.`);
    }

    // Stroke single line.
    this.context.beginPath();
    this.context.moveTo(sx, sy);
    this.context.lineTo(dx, dy);
    this.context.closePath();
    this.context.stroke();
  }

  drawLines(points: Point2D[], color: string) {
    const location = `${this.className}.drawLines()`;

    // Check context.
    if (!this.context) {
      throw Error(`${location} Canvas is not initialized.`);
    }

    // No process when number of points equall to 1.
    if (points.length <= 1) {
      return;
    }

    // Stroke single line.
    this.context.strokeStyle = color;
    this.context.beginPath();
    this.context.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; ++i) {
      this.context.lineTo(points[i].x, points[i].y);
    }
    this.context.closePath();
    this.context.stroke();
  }

  clear() {
    const location = `${this.className}.clear()`;

    // Check context.
    if (!this.context) {
      throw Error(`${location} Canvas is not initialized.`);
    }

    // Clear canvas area.
    if (!this.canvas) {
      console.assert(false);
    } else {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLCanvasElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void {
    if (this.canvas) {
      this.canvas.addEventListener(type, listener, options);
    }
  }

  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLCanvasElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | EventListenerOptions
  ): void {
    if (this.canvas) {
      this.canvas.removeEventListener(type, listener, options);
    }
  }

  //============================================================================
  // Getter / Setter.
  //
  get width(): number {
    return this.canvas ? this.canvas.width : 0;
  }

  set width(width: number) {
    if (this.canvas) {
      this.canvas.width = width;
    }
  }

  get height(): number {
    return this.canvas ? this.canvas.height : 0;
  }

  set height(height: number) {
    if (this.canvas) {
      this.canvas.height = height;
    }
  }

  get fillStyle(): string {
    return this.context ? (this.context.fillStyle as string) : '';
  }

  set fillStyle(style: string) {
    if (this.context) {
      this.context.fillStyle = style;
    }
  }

  get strokeStyle(): string {
    return this.context ? (this.context.strokeStyle as string) : '';
  }

  set strokeStyle(style: string) {
    if (this.context) {
      this.context.strokeStyle = style;
    }
  }
}
