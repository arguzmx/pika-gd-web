import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {OAuthService } from 'angular-oauth2-oidc';
import { LocalStorageService } from 'ngx-localstorage';
import { Traductor } from '../../@editor-entidades/editor-entidades.module';
import { AppLogService } from '../../@pika/servicios';
import { AppConfig } from '../../app-config';

@Component({
  selector: 'ngx-bienvenida',
  templateUrl: './bienvenida.component.html',
  styleUrls: ['./bienvenida.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BienvenidaComponent implements OnInit {
  public T: Traductor;
  cargaFinalizada: boolean = false;
  servidorSaludable: boolean = false;
  constructor(
    private storageService: LocalStorageService,
    private auth: OAuthService,
    private config: AppConfig,
    private cdr: ChangeDetectorRef,
    ts: TranslateService,
    private applog: AppLogService
  ) {
    this.T = new Traductor(ts);
    this.CargaTraducciones();
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
  }

  ngOnInit(): void {
    
  }

  private CargaTraducciones() {
    this.T.ts = [
      'componentes.monitor-salud.titulo',
      'componentes.monitor-salud.nosaludable',
    ];
    this.T.ObtenerTraducciones();
  }

  DatosListos(finalizado: boolean) {
    this.cargaFinalizada = finalizado;
  }
  
  ServidorSaludable(saludable: boolean) {
    this.servidorSaludable=saludable;
    this.cdr.detectChanges();
  }

  login() {
    this.storageService.set("ensesion", 0);
    let url = this.auth.issuer.replace(/\/$/, "") + '/.well-known/openid-configuration';
    this.auth.loadDiscoveryDocument(url)
      .then(() => this.auth.tryLogin())
      .then(() => {
        if (!this.auth.hasValidAccessToken()) {
          this.auth.initImplicitFlow();
        }
      });
  }
}
