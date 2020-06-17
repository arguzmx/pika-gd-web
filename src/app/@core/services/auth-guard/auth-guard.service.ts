import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateChild } from '@angular/router';
import { NbAuthService } from '@nebular/auth';



@Injectable()
export class IsAuthorizedGuard implements CanActivate {
    constructor(private auth: NbAuthService, private router: Router) { }
    async canActivate(): Promise<boolean> {
      const authenticated = await this.auth.isAuthenticated().toPromise();
      if (!authenticated) {
        this.router.navigate(['/acceso/login']);
      } else {
        const validToken = await this.auth.getToken().toPromise();
        if (!validToken.isValid()) {
          this.router.navigate(['/acceso/login']);
        }
      }
      return true;
    }
}


@Injectable()
export class IsChldrenAuthorizedGuard implements CanActivate, CanActivateChild {
    constructor(private auth: NbAuthService, private router: Router) { }


  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    const authenticated = await this.auth.isAuthenticated().toPromise();
    if (!authenticated) {
      this.router.navigate(['/acceso/login']);
    } else {
      const validToken = await this.auth.getToken().toPromise();
      if (!validToken.isValid()) {
        this.router.navigate(['/acceso/login']);
      }
    }
    return true;
  }

  async canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    const authenticated = await this.auth.isAuthenticated().toPromise();
    if (!authenticated) {
      this.router.navigate(['/acceso/login']);
    } else {
      const validToken = await this.auth.getToken().toPromise();
      if (!validToken.isValid()) {
        this.router.navigate(['/acceso/login']);
      }
    }
    return true;
  }
}
