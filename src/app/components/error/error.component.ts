import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss'],
})
export class ErrorComponent implements OnInit {
  readonly className = 'ErrorComponent';

  errorCode = '';

  errorMessage = '';

  private messageMap: { [key: string]: string } = {
    '400': 'Bad Request',
    '401': 'Unauthorized',
    '404': 'Not Found',
    '406': 'Not Acceptable',
    '500': 'Internal Server Error',
  };

  constructor(private logger: NGXLogger, private route: ActivatedRoute) {
    this.logger.trace(`new ${this.className}()`);
  }

  ngOnInit(): void {
    const tmp = this.route.snapshot.paramMap.get('error');
    if (tmp) {
      this.errorCode = tmp;
      this.errorMessage = this.messageMap[this.errorCode];
    }
  }
}
