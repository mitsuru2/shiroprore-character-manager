import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  Route,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppNavigateService implements CanActivate, CanActivateChild {
  readonly className = 'AppNavigateService';

  signedIn = false;

  dataLoaded = false;

  constructor(private logger: NGXLogger, private router: Router) {
    this.logger.trace(`new ${this.className}()`);
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    const location = `${this.className}.canActivate()`;
    this.logger.trace(location, { path: route.url[0].path });

    const path = route.url[0].path;
    return this.canActivatePath(path);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    const location = `${this.className}.canActivateChild()`;
    this.logger.trace(location, { path: childRoute.url[0].path });

    const path = childRoute.url[0].path;
    return this.canActivatePath(path);
  }

  navigate(path: string) {
    this.router.navigateByUrl(path);
  }

  private canActivatePath(path: string): boolean {
    const location = `${this.className}.canActivatePath()`;

    if (path === 'new-character' || path === 'list-character') {
      //  Auth: required
      //  Load: required
      if (!this.dataLoaded) {
        this.logger.error(location, 'Data is not loaded.', { path: path });
        return false;
      }
      if (!this.signedIn) {
        this.logger.error(location, 'Anonymous user is not allowed.', { path: path });
        this.router.navigateByUrl('/main/login');
        return false;
      }
      return true;
    }

    // Other pages everyone can access anytime.
    return true;
  }
}
