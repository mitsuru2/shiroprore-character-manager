import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { NGXLogger } from 'ngx-logger';

@Injectable()
export class UserAuthService {
  readonly className = 'UserAuthService';

  signedIn = false;

  userId = '';

  userName = '';

  //============================================================================
  // Class methods.
  //
  constructor(private logger: NGXLogger, private afAuth: AngularFireAuth) {
    this.logger.trace(`new ${this.className}()`);

    this.checkAuth();
  }

  signIn() {
    const location = `${this.className}.signIn()`;
    this.logger.trace(location);

    this.checkAuth();
  }

  async signOut() {
    const location = `${this.className}.signOut()`;
    this.logger.trace(location);

    if (this.signedIn) {
      await this.afAuth.signOut();
      this.signedIn = false;
      this.userId = '';
      this.userName = '';
    }
  }

  //============================================================================
  // Private methods.
  //
  private async checkAuth() {
    const location = `${this.className}.checkAuthInfo()`;

    const subscription = this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.userId = user.uid;
        this.userName = user.displayName ? user.displayName : '';
        this.signedIn = true;

        this.logger.info(location, { uid: this.userId, name: this.userName });
      }

      subscription.unsubscribe();
    });
  }
}
