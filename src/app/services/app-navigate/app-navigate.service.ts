import { Injectable } from '@angular/core';
import { CanLoad, Route, UrlSegment, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AppStatus } from './app-status.enum';

@Injectable({
  providedIn: 'root',
})
export class AppNavigateService implements CanLoad {
  status = AppStatus.Created;

  // constructor() {}

  canLoad(route: Route, segments: UrlSegment[]): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> { // eslint-disable-line
    if (this.status === AppStatus.Created) {
      return false;
    }
    return true;
  }
}
