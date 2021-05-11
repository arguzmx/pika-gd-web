import { Router } from '@angular/router';
import { AppConfig } from './app-config';
import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from './@core/utils/analytics.service';
import { SeoService } from './@core/utils/seo.service';
import { TranslateService } from '@ngx-translate/core';
import { OAuthErrorEvent, OAuthService, OAuthSuccessEvent } from 'angular-oauth2-oidc';
import { LocalStorageService } from 'ngx-localstorage'
import { decodeJwtPayload } from '@nebular/auth';

@Component({
  selector: 'ngx-app',
  template: '<router-outlet></router-outlet>',
})
export class AppComponent implements OnInit {

  constructor(
    private storageService: LocalStorageService,
    private auth: OAuthService,
    private config: AppConfig,
    public translate: TranslateService,
    private analytics: AnalyticsService,
    private seoService: SeoService,
    private route: Router
  ) {

    translate.addLangs(['es-MX']);
    translate.setDefaultLang('es-MX');

    if (window.location.toString().indexOf('index.html') < 0
        && window.location.toString().indexOf('inicio') < 0) {
      this.storageService.set('returnurl', btoa(this.GetLocation()));
    }

    auth.issuer = this.config.config.authUrl;
    auth.skipIssuerCheck = true;
    auth.clientId = 'api-pika-gd-angular';
    auth.redirectUri = window.location.origin + '/index.html'
    auth.silentRefreshRedirectUri = window.location.origin + '/silent-refresh.html';
    auth.scope = 'openid profile pika-gd';
    auth.useSilentRefresh = true;
    auth.sessionChecksEnabled = false;
    auth.showDebugInformation = false;
    auth.clearHashAfterLogin = false;
    auth.requireHttps = false;
    auth.setStorage(sessionStorage);

    auth.events.subscribe(e => {
      if (e instanceof OAuthSuccessEvent) {

        var ensesion = this.storageService.get('ensesion') == null ? 0 : this.storageService.get('ensesion');
        if (ensesion == 0 && e.type == 'token_received') {
          this.storageService.set('ensesion', 1);

          var urlValue = this.storageService.get('returnurl') == null ? '' : atob(this.storageService.get('returnurl'));
          if (urlValue != '' && urlValue != '/') {
            this.storageService.remove('returnurl')
            this.route.navigateByUrl(urlValue);
          } else {
            this.route.navigateByUrl('/pages/inicio');
          }
        }
      }
      if (e instanceof OAuthErrorEvent) {
        route.navigateByUrl('/bienvenida');
      }
    }
    );



    let url = auth.issuer + '.well-known/openid-configuration';
    this.auth.loadDiscoveryDocument(url).then(() => {

      this.auth.tryLogin({}).then(r => {
        if (!r) {
          this.storageService.set('ensesion', 0);
          this.auth.initImplicitFlow();
        }
      }).catch((err) => {
        this.storageService.set('ensesion', 0);
        this.auth.initImplicitFlow();
      });
    }).catch((err) => { console.error(err) });

  }


  private ValidToken(): boolean {
    const at = window.sessionStorage.getItem('access_token');
    if (at) {
      const d = new Date(0);
      d.setUTCSeconds(decodeJwtPayload(at).exp);
      if (d > (new Date)) {
        return true;
      }
    } else {
      const nonce = window.sessionStorage.getItem('nonce');
      if (nonce) return true;
    }
    return false;
  }

  private GetLocation(): string {
    return window.location.pathname + window.location.search + window.location.hash;
  }

  ngOnInit(): void {
    this.analytics.trackPageViews();
    this.seoService.trackCanonicalChanges();
  }

}
