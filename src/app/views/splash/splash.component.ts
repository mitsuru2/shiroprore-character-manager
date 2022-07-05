import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss'],
})
export class SplashComponent {
  @Input() title: string = '';

  @Input() subTitle?: string;

  @Input() ready: boolean = false;

  @Output() enterEvent = new EventEmitter<boolean>();

  constructor(private logger: NGXLogger) {
    this.logger.trace('new SplashComponent()');
  }

  enter() {
    this.logger.info('Enter button is pressed.');
    this.enterEvent.emit(true);
  }
}
