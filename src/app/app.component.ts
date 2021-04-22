import { Router } from '@angular/router';
import { AppConfig } from './app-config';
import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from './@core/utils/analytics.service';
import { SeoService } from './@core/utils/seo.service';
import { TranslateService } from '@ngx-translate/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { LocalStorageService } from 'ngx-localstorage'

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

    if(window.location.toString().indexOf('index.html') < 0
    && window.location.toString().indexOf('pages/inicio')){
      this.storageService.set('returnurl', btoa(this.GetLocation()));
    }

    let url = auth.issuer + '.well-known/openid-configuration';
    this.auth.loadDiscoveryDocument(url).then(() => {

      this.auth.tryLogin({}).then(r=> {
        if(!r){
          this.auth.initImplicitFlow();
        } else {
          const urlValue = this.storageService.get('returnurl');
          if (urlValue != "") {
            this.storageService.remove('returnurl')
            this.route.navigateByUrl(atob(urlValue)).catch((err) => {
              console.error(err);
            })
          } 
        }
      }).catch((err)=> {
        this.auth.initImplicitFlow();
      });
    }).catch((err) => { console.error(err)});


  }

  private GetLocation(): string {
    return window.location.pathname + window.location.search + window.location.hash;
  }

  ngOnInit(): void {
    this.analytics.trackPageViews();
    this.seoService.trackCanonicalChanges();
  }

}
