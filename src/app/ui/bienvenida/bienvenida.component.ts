import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { ReCaptchaV3Service } from "ng-recaptcha";
import { Observable, pipe } from "rxjs";
import { environment } from "../../../environments/environment";
import { Traductor } from "../../@editor-entidades/editor-entidades.module";
import { AppLogService } from "../../services/app-log/app-log.service";
import { AuthService } from "../../services/auth/auth.service";

@Component({
  selector: "ngx-bienvenida",
  templateUrl: "./bienvenida.component.html",
  styleUrls: ["./bienvenida.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BienvenidaComponent implements OnInit {
  public T: Traductor;
  ver: string = "";
  cargaFinalizada: boolean = false;
  servidorSaludable: boolean = false;
  servidorActivado: boolean = false;
  servidorRegistroDisponible: boolean = false;
  loginForm: FormGroup;
  showPassword = false;
  codigoActivacion: string = "";

  isAuthenticated$: Observable<boolean>;
  isDoneLoading$: Observable<boolean>;
  canActivateProtectedRoutes$: Observable<boolean>;

  constructor(
    private recaptchaV3Service: ReCaptchaV3Service,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    ts: TranslateService,
    formBuilder: FormBuilder,
    private applog: AppLogService
  ) {
    this.loginForm = formBuilder.group({
      inputUsuario: ["", [Validators.required]],
      inputPass: ["", [Validators.required]],
    });
    this.ver = environment.version;
    this.T = new Traductor(ts);
    this.CargaTraducciones();
  }

  ngOnInit(): void {}

  private CargaTraducciones() {
    this.T.ts = [
      "ui.ingresar",
      "ui.contrasena",
      "ui.usuario",
      "ui.activacion-leyenda",
      "componentes.monitor-salud.titulo",
      "componentes.monitor-salud.nosaludable",
      "ui.activacion-fingerprint",
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

  ServidorActivado(activado: boolean) {
    this.servidorActivado = activado;
    this.cdr.detectChanges();
  }

  SetCodigoActivacion(Codigo: string) {
    this.codigoActivacion = Codigo;
    this.cdr.detectChanges();
  }

  SetAccesoServidorRegistro(disponible: boolean) {
    this.servidorRegistroDisponible = disponible;
    this.cdr.detectChanges();
  }

  login() {
    this.recaptchaV3Service
      .execute("importantAction")
      .subscribe((token: string) => {
        this.authService
          .login(
            this.loginForm.get("inputUsuario").value,
            this.loginForm.get("inputPass").value
          )
          .then(() => {})
          .catch(() => {});
      });
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  getInputType() {
    if (this.showPassword) {
      return "text";
    }
    return "password";
  }
}
