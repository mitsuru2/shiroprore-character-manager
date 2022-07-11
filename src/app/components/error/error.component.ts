import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { ErrorHandlerService } from 'src/app/services/error-handler/error-handler.service';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss'],
})
export class ErrorComponent implements OnInit {
  readonly className = 'ErrorComponent';

  errorCode = '';

  errorTitle = '';

  constructor(private logger: NGXLogger, private route: ActivatedRoute, public errorHandler: ErrorHandlerService) {
    this.logger.trace(`new ${this.className}()`);
  }

  ngOnInit(): void {
    const tmp = this.route.snapshot.paramMap.get('error');
    if (tmp) {
      this.errorCode = tmp;
      this.errorTitle = this.errorHandler.getErrorTitle(this.errorCode);
    }
  }
}
