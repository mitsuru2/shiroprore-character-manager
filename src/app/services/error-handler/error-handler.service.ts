import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ErrorCode } from './error-code.enum';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  errorTitle = '';

  errorMessages: string[] = [];

  readonly errorTitleMap = {
    [ErrorCode.BadRequest]: 'Bad Request',
    [ErrorCode.NotFound]: 'Not Found',
    [ErrorCode.InternalServerError]: 'Internal Server Error',
  };

  constructor(private router: Router) {}

  notifyError(error: ErrorCode, message: string): void;

  notifyError(error: ErrorCode, messages: string[]): void;

  notifyError(error: ErrorCode, message: string | string[]): void {
    // Detail info.
    if (typeof message === 'string') {
      this.errorMessages = [message];
    } else {
      this.errorMessages = message;
    }

    // Go to error.
    this.router.navigateByUrl(`/error/${error}`);
  }

  getErrorTitle(error: string): string {
    if (Object.keys(this.errorTitleMap).includes(error)) {
      return this.errorTitleMap[error as ErrorCode];
    }

    return '';
  }
}
