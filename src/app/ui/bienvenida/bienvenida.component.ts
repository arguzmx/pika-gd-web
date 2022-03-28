import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { OAuthService } from "angular-oauth2-oidc";
import { LocalStorageService } from "ngx-localstorage";
import { Traductor } from "../../@editor-entidades/editor-entidades.module";
import { AppConfig } from "../../app-config";
import { AppLogService } from "../../services/app-log/app-log.service";

@Component({
  selector: "ngx-bienvenida",
  templateUrl: "./bienvenida.component.html",
  styleUrls: ["./bienvenida.component.scss"],
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
    auth.clientId = "api-pika-gd-angular";
    auth.redirectUri = window.location.origin + "/index.html";
    auth.silentRefreshRedirectUri =
      window.location.origin + "/silent-refresh.html";
    auth.scope = "openid profile pika-gd";
    auth.useSilentRefresh = true;
    auth.sessionChecksEnabled = false;
    auth.showDebugInformation = true;
    auth.clearHashAfterLogin = false;
    auth.requireHttps = false;
    auth.strictDiscoveryDocumentValidation = false;
    auth.setStorage(sessionStorage);
  }

  ngOnInit(): void {}

  private CargaTraducciones() {
    this.T.ts = [
      "componentes.monitor-salud.titulo",
      "componentes.monitor-salud.nosaludable",
    ];
    this.T.ObtenerTraducciones();
  }

  DatosListos(finalizado: boolean) {
    this.cargaFinalizada = finalizado;
  }

  ServidorSaludable(saludable: boolean) {
    this.servidorSaludable = saludable;
    this.cdr.detectChanges();
  }

  login() {
    
    this.eliminaDatosSesion();
   

    let url =
      this.auth.issuer.replace(/\/$/, "") + "/.well-known/openid-configuration";
    this.auth
      .loadDiscoveryDocument(url)
      .then(() => this.auth.tryLogin())
      .then(() => {
        if (!this.auth.hasValidAccessToken()) {
          this.auth.initImplicitFlow();
        }
      });
  }

  eliminaDatosSesion() {
    window.localStorage.clear();
    this.storageService.set("ensesion", 0);
    
    var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i];
      var eqPos = cookie.indexOf("=");
      var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  }

}
