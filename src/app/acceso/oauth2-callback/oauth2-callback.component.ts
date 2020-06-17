import { PropiedadesSesion } from './../../@pika/state/sesion.store';
import { Component, OnDestroy } from '@angular/core';
import { NbAuthResult, NbAuthService } from '@nebular/auth';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { SesionStore } from '../../@pika/state/sesion.store';
import * as jwt_decode from 'jwt-decode';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'ngx-oauth2-callback',
  template: `
    <nb-layout>
      <nb-layout-column>Authenticating...</nb-layout-column>
    </nb-layout>
  `,
})
export class OAuth2CallbackComponent implements OnDestroy {

  private destroy$ = new Subject<void>();

  constructor(private authService: NbAuthService, private sessionStore: SesionStore,  private router: Router) {

    this.authService.authenticate('is4')
      .pipe(takeUntil(this.destroy$))
      .subscribe((authResult: NbAuthResult) => {
        if (authResult.isSuccess() ) {
          const token = authResult.getToken().getPayload().access_token;
          const info = jwt_decode(token);
          sessionStore.login(info.sub, token);
          if ( authResult.getRedirect()) {
            this.router.navigateByUrl(environment.callbackRoute);
          } else {
            this.router.navigateByUrl(environment.callbackRoute);
          }
        } else {
          sessionStore.logout();
          this.router.navigateByUrl('/acceso/login');
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
