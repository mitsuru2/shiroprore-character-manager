import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { NGXLogger } from 'ngx-logger';
import { Subscription } from 'rxjs';
import { ErrorCode } from 'src/app/services/error-handler/error-code.enum';
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

  private _subscription?: Subscription;

  private readonly _maxMonitoringTime = 30000; // 30 sec.

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
  /**
   * The user auth service starts monitoring the user auth status at its constructor.
   * This is because the web page will be reloaded by the user sign in action.
   * So, by starting monitoring at constructor, the service can surely catch the signed in event.
   * It stops monitoring when it detects the signed in event or it timed out.
   * @param logger NGX Logger.
   * @param afAuth AngularFire authentication module.
   * @param firestore Firestore data service.
   * @param errorHandler Error handling service.
   */
  constructor(private logger: NGXLogger, private afAuth: AngularFireAuth, private firestore: FirestoreDataService, private errorHandler: ErrorHandlerService) {
    this.logger.trace(`new ${this.className}()`);

    this.startMonitoringAuthState();
    setTimeout(() => {
      if (this._subscription) {
        this.logger.warn(this.className, 'Signed in event is not published. It stops subscription.');
        this._subscription.unsubscribe();
        this._subscription = undefined;
      }
    }, this._maxMonitoringTime);
  }

  /**
   * It clears the user auth status (sign out).
   * If there is no sign in user, it will do nothing.
   */
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

  /**
   * It removes all user data and user account of the current signed in user.
   * If there is no signed in user, it will do nothing.
   */
  async removeCurrentUser() {
    const location = `${this.className}.removeCurrentUser()`;
    this.logger.trace(location, { userId: this._userId });

    if (this.signedIn) {
      (await this.afAuth.currentUser)?.delete();
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

  /**
   * It register the callback function which is called by user auth event is occurred.
   * @param event User authentication event. 'signIn' or 'signOut'.
   * @param cbFn Callback function.
   */
  addEventListener(event: 'signIn' | 'signOut', cbFn: () => void) {
    const location = `${this.className}.addEventListener()`;
    this.logger.trace(location, { event: event, cbFn: cbFn });

    // Add event listner function to the internal array.
    this._eventListeners.push({ event: event, cbFn: cbFn });

    // Is the class has already been _initialized, it calls the registered function right now.
    if (this._initialized) {
      if (event === 'signIn' && this._signedIn) {
        cbFn();
      } else if (event === 'signOut' && !this._signedIn) {
        cbFn();
      }
    }
  }

  /**
   * It removes the registered event listener.
   * @param cbFn Callback function.
   */
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
  /**
   * It starts subscription of the 'afAuth.authState'.
   * By this, it can detect when a user signed in.
   * When it detect a user, it will load and get the user data
   * and execute registered event listener functions.
   */
  private startMonitoringAuthState() {
    const location = `${this.className}.startMonitoringAuthState()`;
    this.logger.trace(location);

    this._subscription = this.afAuth.authState.subscribe(async (user) => {
      if (user) {
        // Update class variables.
        this._initialized = true;
        this._userId = user.uid;
        this._signedIn = true;

        // Set user ID to the firestore data service.
        this.firestore.setUserId(user.uid);

        // Load user data from Firestore.
        await this.loadUserData(user.uid);

        // Run callback functions.
        for (let i = 0; i < this._eventListeners.length; ++i) {
          if (this._eventListeners[i].event === 'signIn') {
            await this._eventListeners[i].cbFn();
          }
        }

        // Unsubscribe.
        if (this._subscription) {
          this.logger.info(this.className, 'It caught the signed in event and stops subscription.');
          this._subscription.unsubscribe();
          this._subscription = undefined;
        }
      }
    });
  }

  /**
   * It loads user data from Firestore database.
   * If corresponding user data is not found, it means that the user is new user.
   * In this case, it will make new user data on the firestore DB.
   * @param uid User ID.
   */
  private async loadUserData(uid: string) {
    const location = `${this.className}.loadUserData()`;

    // Load user info from database.
    // If there is no data, register as a new user.
    try {
      const userCount = await this.firestore.load(FsCollectionName.Users, uid);
      if (userCount === 0) {
        const docId = await this.firestore.addData(FsCollectionName.Users, new FsUser('', uid));
        this.logger.info(location, 'Add a new user.', { uid: uid, docId: docId });
        await this.firestore.load(FsCollectionName.Users, uid);
      }
    } catch (error) {
      this.errorHandler.notifyError(error);
    }

    // Get user data.
    // Store data if user ID is matched.
    const tmp = this.firestore.getData(FsCollectionName.Users) as FsUser[];
    if (tmp.length > 0 && tmp[0].name === this._userId) {
      this._userData = tmp[0];
    } else {
      const error = new Error(`${location} User data loading failed. { uid: ${uid} }`);
      error.name = ErrorCode.Unexpected;
      this.errorHandler.notifyError(error);
    }
  }
}
