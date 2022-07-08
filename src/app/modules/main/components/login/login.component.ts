import { Component, OnInit } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { AppNavigateService } from 'src/app/services/app-navigate/app-navigate.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  readonly className = 'LoginComponent';

  constructor(private logger: NGXLogger, private navigator: AppNavigateService) {
    this.logger.trace(`new ${this.className}()`);
  }

  ngOnInit(): void {}

  onAuthSuccess(event: any) {
    const location = `${this.className}.onAuthSuccess()`;
    this.logger.trace(location);

    this.navigator.signedIn = true;
    this.navigator.navigate('main/list-character');
  }

  onAuthFail(event: any) {
    const location = `${this.className}.onAuthFail()`;
    this.logger.trace(location);

    this.navigator.signedIn = false;
  }
}
