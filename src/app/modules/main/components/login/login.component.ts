import { Component } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { UserAuthService } from '../../services/user-auth/user-auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent /*implements OnInit*/ {
  readonly className = 'LoginComponent';

  constructor(private logger: NGXLogger, public userAuth: UserAuthService) {
    this.logger.trace(`new ${this.className}()`);
  }

  // ngOnInit(): void {}
}
