import { Injectable } from '@angular/core';
import { getBlob, ref, Storage, uploadBytes } from '@angular/fire/storage';
import { NGXLogger } from 'ngx-logger';
import { ErrorCode } from '../error-handler/error-code.enum';

@Injectable({
  providedIn: 'root',
})
export class CloudStorageService {
  readonly className = 'CloudStorageService';

  dataPool: { path: string; data: Blob }[] = [];

  constructor(private logger: NGXLogger, private storage: Storage) {
    this.logger.trace(`new ${this.className}()`);
  }

  makeCharacterImagePath(index: string, type: string, kaichiku: boolean = false): string {
    if (!kaichiku) {
      return `images/characters/${index}/${index}_${type}.png`;
    } else {
      return `images/characters/${index}/${index}_${type}_kai.png`;
    }
  }

  makeCharacterThumbnailPath(index: string): string {
    return `images/characters/${index}/${index}_thumb.jpg`;
  }

  async upload(path: string, data: Blob): Promise<void> {
    const location = `${this.className}.upload()`;
    this.logger.trace(location);

    const dataRef = ref(this.storage, path);
    try {
      await uploadBytes(dataRef, data);
    } catch (error) {
      (error as Error).name = ErrorCode.InternalServerError;
      throw error;
    }

    // Clear image pool, if the uploaded data has been downloaded before.
    const index = this.dataPool.findIndex((item) => item.path === path);
    if (index >= 0) {
      this.dataPool.splice(index, 1);
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
      const error = new Error(`${location} Data is not found. { path: ${path} }`);
      error.name = ErrorCode.Unexpected;
      throw error;
    }

    return this.dataPool[index].data;
  }

  //============================================================================
  // Private methods.
  //
  private async download(path: string): Promise<void> {
    const location = `${this.className}.download()`;
    this.logger.trace(location, { path: path });

    const dataRef = ref(this.storage, path);
    try {
      const data = await getBlob(dataRef);
      this.dataPool.push({ path: path, data: data });
    } catch {
      // Hide exception because it continue process without data.
      this.logger.error(location, 'It failed to download data.', { path: path });
    }
  }
}
