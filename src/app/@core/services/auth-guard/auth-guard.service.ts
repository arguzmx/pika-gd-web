import { AuthService } from './../../../@acceso/auth.service';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateChild } from '@angular/router';
import { filter, switchMap, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';




@Injectable()
export class IsChldrenAuthorizedGuard implements CanActivate, CanActivateChild {

  constructor(
    private authService: AuthService,
  ) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean> {
    return this.authService.isDoneLoading$.pipe(
      filter(isDone => isDone),
      switchMap(_ => this.authService.isAuthenticated$),
      tap(isAuthenticated => isAuthenticated ||
        this.authService.login(state.url)),
    );
  }

 
  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    // return this.authService.Autenticado$
    // .pipe(tap(x => console.log('You tried to go to ' + state.url + ' and this guard said ' + x)));
    return this.authService.isDoneLoading$.pipe(
      filter(isDone => isDone),
      switchMap(_ => this.authService.isAuthenticated$),
      tap(isAuthenticated => isAuthenticated ||
        this.authService.login(state.url)),
    );
  }
}
