import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';

export type SpinnerControlType = 'show' | 'hide';

@Injectable()
export class SpinnerService {
  private readonly className = 'SpinnerService';

  private showSpinnerFn?: () => void;

  private hideSpinnerFn?: () => void;

  //============================================================================
  // Class methods.
  //
  constructor(private logger: NGXLogger) {
    this.logger.trace(`new ${this.className}()`);
  }

  addSpinnerControlFunction(type: SpinnerControlType, fn: () => void) {
    if (type === 'show') {
      this.showSpinnerFn = fn;
    } else {
      this.hideSpinnerFn = fn;
    }
  }

  show() {
    if (this.showSpinnerFn) {
      this.showSpinnerFn();
    }
  }

  hide() {
    if (this.hideSpinnerFn) {
      this.hideSpinnerFn();
    }
  }
}
