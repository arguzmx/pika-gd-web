import { Component, OnInit } from '@angular/core';
import {OAuthService } from 'angular-oauth2-oidc';
import { AppConfig } from '../../app-config';

@Component({
  selector: 'ngx-bienvenida',
  templateUrl: './bienvenida.component.html',
  styleUrls: ['./bienvenida.component.scss']
})
export class BienvenidaComponent implements OnInit {

  constructor(
    private auth: OAuthService,
    private config: AppConfig,
  ) {

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
  }

  ngOnInit(): void {
  }

  login() {

    let url = this.auth.issuer + '.well-known/openid-configuration';
    this.auth.loadDiscoveryDocument(url)
      .then(() => this.auth.tryLogin())
      .then(() => {
        if (!this.auth.hasValidAccessToken()) {
          this.auth.initImplicitFlow();
        };
      });
  }
}
