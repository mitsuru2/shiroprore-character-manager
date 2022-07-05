import { Injectable } from '@angular/core';
import { getBlob, ref, Storage, uploadBytes } from '@angular/fire/storage';
import { NGXLogger } from 'ngx-logger';

@Injectable({
  providedIn: 'root',
})
export class CloudStorageService {
  readonly className = 'CloudStorageService';

  dataPool: { path: string; data: Blob }[] = [];

  constructor(private logger: NGXLogger, private storage: Storage) {
    this.logger.trace(`new ${this.className}()`);
  }

  async upload(path: string, data: Blob): Promise<void> {
    const location = `${this.className}.upload()`;
    this.logger.trace(location);

    const dataRef = ref(this.storage, path);
    try {
      await uploadBytes(dataRef, data);
    } catch {
      this.logger.error(location, 'It failed to upload data.', { path: path });
    }
  }

  async get(path: string): Promise<Blob> {
    const location = `${this.className}.get()`;
    this.logger.trace(location, { path: path });

    // Download data if it's not downloaded.
    if (this.dataPool.findIndex((item) => item.path === path) < 0) {
      await this.download(path);
    }

    // Return data.
    const index = this.dataPool.findIndex((item) => item.path === path);
    if (index < 0) {
      throw Error(`${location} Data is not found. ${{ path: path }}`);
    }

    return this.dataPool[index].data;
  }

  private async download(path: string): Promise<void> {
    const location = `${this.className}.download()`;

    const dataRef = ref(this.storage, path);
    try {
      const data = await getBlob(dataRef);
      this.dataPool.push({ path: path, data: data });
    } catch {
      this.logger.error(location, 'It failed to download data.', { path: path });
    }
  }

  makeCharacterImagePath(index: string, type: string, kaichiku: boolean): string {
    if (!kaichiku) {
      return `images/characters/${index}/${index}_${type}.png`;
    } else {
      return `images/characters/${index}/${index}_${type}_kai.png`;
    }
  }

  makeCharacterThumbnailPath(index: string): string {
    return `images/characters/${index}/${index}_thumb.jpg`;
  }
}
