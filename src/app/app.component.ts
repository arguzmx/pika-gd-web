import { AppConfig } from './app-config';
import { first } from 'rxjs/operators';
/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from './@core/utils/analytics.service';
import { SeoService } from './@core/utils/seo.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { JwksValidationHandler, OAuthService } from 'angular-oauth2-oidc';



@Component({
  selector: 'ngx-app',
  template: '<router-outlet></router-outlet>',
})
export class AppComponent implements OnInit {

  constructor(
    private auth: OAuthService,
    private config: AppConfig,
    public translate: TranslateService,
    private analytics: AnalyticsService,
    private seoService: SeoService,

  ) {
    translate.addLangs(['es-MX']);
    translate.setDefaultLang('es-MX');

    auth.issuer = this.config.config.authUrl;
    auth.skipIssuerCheck = true;
    auth.clientId = 'api-pika-gd-angular';
    auth.redirectUri = window.location.origin + '/index.html'
    auth.silentRefreshRedirectUri = window.location.origin + '/silent-refresh.html';
    auth.scope = 'openid profile pika-gd';
    auth.useSilentRefresh = true;
    auth.sessionChecksEnabled = false;
    auth.showDebugInformation = true;
    auth.clearHashAfterLogin = false;
    auth.requireHttps = false;
    auth.setStorage(sessionStorage);

    let url = auth.issuer + '.well-known/openid-configuration';
    this.auth.loadDiscoveryDocument(url).then(() => {
      this.auth.tryLogin({}).then(r=> {
        if(!r){
          this.auth.initImplicitFlow();
        }
      }).catch((err)=> { 
        this.auth.initImplicitFlow();
      });

    }).catch((err) => { console.error(err)});


  }

  ngOnInit(): void {
    this.analytics.trackPageViews();
    this.seoService.trackCanonicalChanges();
  }

}
