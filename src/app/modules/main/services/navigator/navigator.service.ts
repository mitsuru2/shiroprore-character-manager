import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChild, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { FirestoreDataService } from 'src/app/services/firestore-data/firestore-data.service';
import { sleep } from '../../utils/sleep/sleep.utility';
import { UserAuthService } from '../user-auth/user-auth.service';

@Injectable()
export class NavigatorService implements CanActivateChild {
  readonly className = 'NavigatorService';

  paramStorage: {
    [key: string]: any;
  } = { 'list-character': undefined, 'new-character': undefined, character: undefined, legal: undefined };

  //============================================================================
  // Class methods.
  //
  constructor(
    private logger: NGXLogger,
    private router: Router,
    private userAuth: UserAuthService,
    private firestore: FirestoreDataService
  ) {
    this.logger.trace(`new ${this.className}()`);
  }

  async canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean | UrlTree> { // eslint-disable-line
    const location = `${this.className}.canActivateChild()`;
    const path = childRoute.url[0].path;

    this.logger.trace(location, { path: path });

    if (path === 'new-character') {
      if (!this.userAuth.signedIn) {
        this.logger.error(location, 'Anonymous user is not allowed.', { path: path });
        this.router.navigateByUrl('main/login');
        return false;
      }
      if (!this.firestore.loaded) {
        await this.waitUntilLoaded(10); // 10s.
        return true;
      }
    }

    if (path === 'list-character') {
      if (!this.firestore.loaded) {
        await this.waitUntilLoaded(10); // 10s.
        return true;
      }
    }

    // Default true;
    return true;
  }

  private async waitUntilLoaded(timeout: number): Promise<void> {
    const maxCount = timeout * 10;

    for (let i = 0; i < maxCount; ++i) {
      await sleep(100);
      if (this.firestore.loaded) {
        break;
      }
    }
  }
}
