import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { Traductor } from "../../@editor-entidades/editor-entidades.module";
import { AuthService } from "../../services/auth/auth.service";

@Component({
  selector: "ngx-bienvenida",
  templateUrl: "./bienvenida.component.html",
  styleUrls: ["./bienvenida.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BienvenidaComponent implements OnInit {
  public T: Traductor;
  ver: string = '';
  cargaFinalizada: boolean = false;
  servidorSaludable: boolean = false;


  isAuthenticated$: Observable<boolean>;
  isDoneLoading$: Observable<boolean>;
  canActivateProtectedRoutes$: Observable<boolean>;

  constructor(
    private authService: AuthService,
    // private auth: OAuthService,
    private cdr: ChangeDetectorRef,
    ts: TranslateService,
  ) {
    this.ver = environment.version
    this.T = new Traductor(ts);
    this.CargaTraducciones();
    // auth.issuer = this.config.config.authUrl;
    // auth.skipIssuerCheck = true;
    // auth.clientId = "api-pika-gd-angular";
    // auth.redirectUri = window.location.origin + "/index.html";
    // auth.silentRefreshRedirectUri =
    //   window.location.origin + "/silent-refresh.html";
    // auth.scope = "openid profile pika-gd";
    // auth.useSilentRefresh = true;
    // auth.sessionChecksEnabled = false;
    // auth.showDebugInformation = true;
    // auth.clearHashAfterLogin = false;
    // auth.requireHttps = false;
    // auth.strictDiscoveryDocumentValidation = false;
    // auth.setStorage(sessionStorage);

    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.isDoneLoading$ = this.authService.isDoneLoading$;
    this.canActivateProtectedRoutes$ = this.authService.canActivateProtectedRoutes$;

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
    this.authService.login();
  }
}
