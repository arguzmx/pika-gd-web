import { Router } from "@angular/router";
import { AppConfig } from "./app-config";
import { Component, OnInit } from "@angular/core";
import { AnalyticsService } from "./@core/utils/analytics.service";
import { SeoService } from "./@core/utils/seo.service";
import { TranslateService } from "@ngx-translate/core";
import {
  OAuthErrorEvent,
  OAuthService,
  OAuthSuccessEvent,
} from "angular-oauth2-oidc";
import { LocalStorageService } from "ngx-localstorage";
import { decodeJwtPayload } from "@nebular/auth";

@Component({
  selector: "ngx-app",
  template: "<router-outlet></router-outlet>",
})
export class AppComponent implements OnInit {

  private enSesion: number;
  private enLogin: number;

  constructor(
    private storageService: LocalStorageService,
    private auth: OAuthService,
    private config: AppConfig,
    public translate: TranslateService,
    private analytics: AnalyticsService,
    private seoService: SeoService,
    private route: Router
  ) {
    translate.addLangs(["es-MX"]);
    translate.setDefaultLang("es-MX");

    this.enSesion = this.storageService.get("ensesion") == null ? 0 : this.storageService.get("ensesion");
    this.enLogin = this.storageService.get("login") == null ? 0 : this.storageService.get("ensesion");

    if(this.enSesion === 1 && this.enLogin === 1) {
      this.storageService.remove("login");
      this.enLogin = 0;
    }
    // alert(window.location);
    // alert(this.GetLocation());
    // Al cargar añade la URL de retorno si no es el callback de index o l apágina de inicio o la raíz
    if (
      this.GetLocation() != '/' &&
      window.location.toString().indexOf("index.html") < 0 &&
      window.location.toString().indexOf("inicio") < 0
    ) {
      this.storageService.set("returnurl", btoa(this.GetLocation()));
    } else {
      this.storageService.set("returnurl", null);
    }
    
    // Configura la sesión
    auth.issuer = this.config.config.authUrl;
    auth.skipIssuerCheck = true;
    auth.clientId = "api-pika-gd-angular";
    auth.redirectUri = window.location.origin + "/index.html";
    auth.silentRefreshRedirectUri =
      window.location.origin + "/silent-refresh.html";
    auth.scope = "openid profile pika-gd";
    auth.useSilentRefresh = true;
    auth.sessionChecksEnabled = false;
    auth.showDebugInformation = false;
    auth.clearHashAfterLogin = false;
    auth.requireHttps = false;
    auth.setStorage(sessionStorage);
    // auth.showDebugInformation = true;

    //  Asigna el listener de eventos de login
    auth.events.subscribe((e) => {
      if (e instanceof OAuthSuccessEvent) {
        // this.enSesion =
        //   this.storageService.get("ensesion") == null
        //     ? 0
        //     : this.storageService.get("ensesion");
        
        if (this.enSesion == 0 && e.type == "token_received") {
          this.storageService.set("ensesion", 1);
          this.storageService.remove("login");
          this.enSesion = 1;
          var urlValue =
            this.storageService.get("returnurl") == null
              ? ""
              : atob(this.storageService.get("returnurl"));

              //window.alert(urlValue);
          if (
            urlValue != "" &&
            urlValue != "/" &&
            urlValue.toLowerCase().indexOf("bienvenida") < 0
          ) {
            // window.alert('urlValue');
            this.storageService.remove("returnurl");
            this.route.navigateByUrl(urlValue);
          } else {
            // window.alert('incisio');
            this.route.navigateByUrl("/pages/inicio");
          }
        }
      }
      if (e instanceof OAuthErrorEvent) {
        route.navigateByUrl("/bienvenida");
      }
    });


    let url = auth.issuer + ".well-known/openid-configuration";
    if (this.storageService.get("ensesion") === -1) {
      route.navigateByUrl("/bienvenida");
    } else {
      if(this.enLogin === 0 ) {
        this.storageService.set("login", 1);
        this.auth
        .loadDiscoveryDocument(url)
        // 1. HASH LOGIN:
        // Try to log in via hash fragment after redirect back
        // from IdServer from initImplicitFlow:
        .then(() => this.auth.tryLogin())

        .then(() => {
          if (!this.auth.hasValidAccessToken()) {
            this.storageService.set("ensesion", -1);
          } else {
            this.auth
              .loadDiscoveryDocument(url)
              .then(() => {
                this.auth
                  .tryLogin({})
                  .then((r) => {
                    if (!r && this.enSesion === 0) {
                      this.storageService.set("ensesion", 0);
                      this.auth.initImplicitFlow();
                    } else {
                      this.storageService.remove("login");
                    }
                  })
                  .catch((err) => {
                    if (this.enSesion === 0) {
                      this.storageService.set("ensesion", 0);
                      this.auth.initImplicitFlow();
                    } else {
                      this.storageService.remove("login");
                    }
                  });
              })
              .catch((err) => {
                console.error(err);
              });
          }
        });
      }
    }
  }

  private ValidToken(): boolean {
    const at = window.sessionStorage.getItem("access_token");
    if (at) {
      const d = new Date(0);
      d.setUTCSeconds(decodeJwtPayload(at).exp);
      if (d > new Date()) {
        return true;
      }
    } else {
      const nonce = window.sessionStorage.getItem("nonce");
      if (nonce) return true;
    }
    return false;
  }

  private GetLocation(): string {
    return (
      window.location.pathname + window.location.search + window.location.hash
    );
  }

  ngOnInit(): void {
    this.analytics.trackPageViews();
    this.seoService.trackCanonicalChanges();
  }
}
