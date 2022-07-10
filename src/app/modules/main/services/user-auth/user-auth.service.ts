import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { NGXLogger } from 'ngx-logger';

@Injectable()
export class UserAuthService {
  readonly className = 'UserAuthService';

  signedIn = false;

  userId = '';

  userName = '';

  private eventListeners: { event: string; cbFn: () => void }[] = [];

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

      for (let i = 0; i < this.eventListeners.length; ++i) {
        if (this.eventListeners[i].event === 'signOut') {
          this.eventListeners[i].cbFn();
        }
      }
    }
  }

  addEventListener(event: 'signIn' | 'signOut', cbFn: () => void) {
    const location = `${this.className}.addEventListener()`;
    this.logger.trace(location, { event: event, cbFn: cbFn });

    this.eventListeners.push({ event: event, cbFn: cbFn });

    if (event === 'signIn' && this.signedIn) {
      cbFn();
    } else if (event === 'signOut' && !this.signedIn) {
      cbFn();
    }
  }

  removeEventListener(cbFn: () => void) {
    const location = `${this.className}.removeEventListener()`;
    this.logger.trace(location, { cbFn: cbFn });

    const index = this.eventListeners.findIndex((item) => item.cbFn === cbFn);
    if (index >= 0) {
      this.eventListeners.splice(index, 1);
    } else {
      this.logger.warn(location, 'The target listener is not found.');
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

        // Run callback functions.
        for (let i = 0; i < this.eventListeners.length; ++i) {
          if (this.eventListeners[i].event === 'signIn') {
            this.eventListeners[i].cbFn();
          }
        }
      }

      subscription.unsubscribe();
    });
  }
}
