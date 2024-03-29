export class XY {
  x: number = 0;

  y: number = 0;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  add(pos: XY) {
    return new XY(this.x + pos.x, this.y + pos.y);
  }

  sub(pos: XY) {
    return new XY(this.x - pos.x, this.y - pos.y);
  }

  multi(f: number) {
    return new XY(this.x * f, this.y * f);
  }

  div(f: number) {
    return new XY(this.x / f, this.y / f);
  }
}

export interface MakeThumbnailFormResult {
  canceled: boolean;
  thumb?: Blob;
}

export class ThumbnailMakeInfo {
  image: Blob = new Blob();

  imageSize: XY = new XY(80, 80);

  offset: XY = new XY(0, 0);

  scale: number = 100;

  thumb: Blob = new Blob();
}
