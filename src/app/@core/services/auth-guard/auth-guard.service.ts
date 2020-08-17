import { PropiedadesSesion } from './../../../@pika/state/sesion.store';
import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateChild } from '@angular/router';
import { NbAuthService, NbAuthSimpleToken, NbTokenService } from '@nebular/auth';
import { SesionStore } from '../../../@pika/state/sesion.store';
import { CookieService } from 'ngx-cookie-service';
import * as jwt_decode from 'jwt-decode';
import { PikaSesinService } from '../../../@pika/pika-api/pika-sesion-service';
import { first } from 'rxjs/operators';


@Injectable()
export class IsAuthorizedGuard implements CanActivate {
    constructor(private auth: NbAuthService, private router: Router) { }
    async canActivate(): Promise<boolean> {
      // const authenticated = await this.auth.isAuthenticatedOrRefresh().toPromise();
      // if (!authenticated) {
      //   this.router.navigate(['/acceso/login']);
      // } else {
      //   const validToken = await this.auth.getToken().toPromise();
      //   if (!validToken.isValid()) {
      //     this.router.navigate(['/acceso/login']);
      //   }
      // }
      return true;
    }
}


@Injectable()
export class IsChldrenAuthorizedGuard implements CanActivate, CanActivateChild {
    constructor(private auth: NbAuthService, private token: NbTokenService,
      private session: SesionStore, private cookies: CookieService, 
      private sessionService: PikaSesinService, private storeSesion: SesionStore,
       private router: Router) { }


  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    // const authenticated = await this.auth.isAuthenticatedOrRefresh().toPromise();
    // if (!authenticated) {
    //   this.router.navigate(['/acceso/login']);
    // } else {
    //   const validToken = await this.auth.getToken().toPromise();
    //   if (!validToken.isValid()) {
    //     this.router.navigate(['/acceso/login']);
    //   }
    // }
    return true;
  }

  async canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    const t = await this.token.get().toPromise();
    let authenticated = await this.auth.isAuthenticated().toPromise();
    if (!authenticated) {
      this.cookies.set('gotopage', window.location.href);
      const a = this.auth.authenticate('is4').toPromise();
        authenticated = await this.auth.isAuthenticated().toPromise();
    }

    if (!authenticated) {
      this.cookies.set('gotopage', window.location.href);
      this.router.navigate(['/acceso/login']);
    } else {
      const info = jwt_decode(t.getValue());
      this.session.login(info.sub, t.getValue());
      this.sessionService.GetDominios().pipe(
        first(),
      ).subscribe( dominios => {
          this.storeSesion.setDominios(dominios);
      }, (err) => {
          console.log(err);
      });
    }
    return authenticated;
  }
}
