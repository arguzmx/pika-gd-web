import { CookieService } from 'ngx-cookie-service';
import { PikaSesinService } from './../../@pika/pika-api/pika-sesion-service';
import { Component, OnDestroy, OnInit } from '@angular/core';
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
export class OAuth2CallbackComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  constructor(private authService: NbAuthService,
    private sessionStore: SesionStore,
    private router: Router, private cookies: CookieService) {
  }
  ngOnInit(): void {
    this.authService
    .isAuthenticated().subscribe( result => {
      let url = this.cookies.get('gotopage');
 
      if (result) {
        if (url) {
          this.cookies.delete('gotopage');
          url = url.replace(window.location.origin, '');
        } else {
          url =  environment.callbackRoute;
        }
        this.router.navigateByUrl(url);
      } else {
        this.authService.authenticate('is4').subscribe( done => {
          if (done) {
            url =  environment.callbackRoute;
          } else {
            url = '/acceso/login';
          }
          this.router.navigateByUrl(url);
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
