import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ErrorCode } from './error-code.enum';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  errorTitle = '';

  errorCode = '';

  errorMessage: string = '';

  errorStack?: string;

  readonly errorTitleMap = {
    [ErrorCode.BadRequest]: 'Bad Request',
    [ErrorCode.NotFound]: 'Not Found',
    [ErrorCode.MethodNotAllowed]: 'Method Not Allowed',
    [ErrorCode.InternalServerError]: 'Internal Server Error',
    [ErrorCode.Unexpected]: 'Unexpected Internal Error',
  };

  constructor(private router: Router) {}

  notifyError(error: any): void {
    // Detail info.
    this.errorCode = (error as Error).name;
    this.errorMessage = (error as Error).message;
    this.errorStack = (error as Error).stack;

    // Overwrite error code when unsupported.
    if (!Object.keys(this.errorTitleMap).includes(this.errorCode)) {
      this.errorCode = ErrorCode.Unexpected;
    }

    // Go to error.
    this.router.navigateByUrl(`/error/${this.errorCode}`);
  }

  getErrorTitle(error: string): string {
    if (Object.keys(this.errorTitleMap).includes(error)) {
      return this.errorTitleMap[error as ErrorCode];
    }

    return '';
  }
}
