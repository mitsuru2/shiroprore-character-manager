import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { NGXLogger } from 'ngx-logger';
import { ErrorHandlerService } from 'src/app/services/error-handler/error-handler.service';
import { FsCollectionName } from 'src/app/services/firestore-data/firestore-collection-name.enum';
import { FirestoreDataService } from 'src/app/services/firestore-data/firestore-data.service';
import { FsUser } from 'src/app/services/firestore-data/firestore-document.interface';

@Injectable()
export class UserAuthService {
  private readonly className = 'UserAuthService';

  private _initialized = false;

  private _signedIn = false; // Read only from other classes.

  private _userId = ''; // Read only from other classes.

  private _userData = new FsUser(); // Read only from other classes.

  private _eventListeners: { event: string; cbFn: () => void }[] = [];

  //============================================================================
  // Getter / setter.
  //
  get signedIn(): boolean {
    return this._signedIn;
  }

  get userId(): string {
    return this._userId;
  }

  get userData(): FsUser {
    return this._userData;
  }

  //============================================================================
  // Class methods.
  //
  constructor(
    private logger: NGXLogger,
    private afAuth: AngularFireAuth,
    private firestore: FirestoreDataService,
    private errorHandler: ErrorHandlerService
  ) {
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
      this._signedIn = false;
      this._userId = '';
      this._userData = new FsUser();

      for (let i = 0; i < this._eventListeners.length; ++i) {
        if (this._eventListeners[i].event === 'signOut') {
          this._eventListeners[i].cbFn();
        }
      }
    }
  }

  async addEventListener(event: 'signIn' | 'signOut', cbFn: () => void) {
    const location = `${this.className}.addEventListener()`;
    this.logger.trace(location, { event: event, cbFn: cbFn });

    // Add event listner function to the internal array.
    this._eventListeners.push({ event: event, cbFn: cbFn });

    // Is the class has already been _initialized, it calls the registered function right now.
    if (this._initialized) {
      if (event === 'signIn' && this._signedIn) {
        await cbFn();
      } else if (event === 'signOut' && !this._signedIn) {
        await cbFn();
      }
    }
  }

  removeEventListener(cbFn: () => void) {
    const location = `${this.className}.removeEventListener()`;
    this.logger.trace(location, { cbFn: cbFn });

    const index = this._eventListeners.findIndex((item) => item.cbFn === cbFn);
    if (index >= 0) {
      this._eventListeners.splice(index, 1);
    } else {
      this.logger.warn(location, 'The target listener is not found.');
    }
  }

  //============================================================================
  // Private methods.
  //
  private async checkAuth() {
    const location = `${this.className}.checkAuthInfo()`;

    const subscription = this.afAuth.authState.subscribe(async (user) => {
      if (user) {
        // Update class variables.
        this._initialized = true;
        this._userId = user.uid;
        this._signedIn = true;
        this.logger.info(location, 'User signed in.', { uid: this._userId });

        // Load user info from database.
        // If there is no data, register as a new user.
        try {
          const userCount = await this.firestore.load(FsCollectionName.Users, this._userId);
          if (userCount === 0) {
            const docId = await this.firestore.addData(FsCollectionName.Users, new FsUser('', this._userId));
            this.logger.info(location, 'Add a new user.', { uid: this._userId, docId: docId });
            await this.firestore.load(FsCollectionName.Users, this._userId);
          }
        } catch (error) {
          this.errorHandler.notifyError(error);
        }

        // Get user data.
        // Store data if user ID is matched.
        const tmp = this.firestore.getData(FsCollectionName.Users) as FsUser[];
        if (tmp.length > 0) {
          if (tmp[0].name === this._userId) {
            this._userData = tmp[0];
          }
        }

        // Run callback functions.
        for (let i = 0; i < this._eventListeners.length; ++i) {
          if (this._eventListeners[i].event === 'signIn') {
            await this._eventListeners[i].cbFn();
          }
        }
      }

      subscription.unsubscribe();
    });
  }
}
