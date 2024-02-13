import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { ReCaptchaV3Service } from "ng-recaptcha";
import { Observable, pipe, timer } from "rxjs";
import { environment } from "../../../environments/environment";
import { Traductor } from "../../@editor-entidades/editor-entidades.module";
import { AppLogService } from "../../services/app-log/app-log.service";
import { AuthService } from "../../services/auth/auth.service";
import { map, take } from "rxjs/operators";

const countdown$ = timer(0, 1000).pipe(
  take(5),
  map(secondsElapsed => 5 - secondsElapsed)
);

@Component({
  selector: "ngx-bienvenida",
  templateUrl: "./bienvenida.component.html",
  styleUrls: ["./bienvenida.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BienvenidaComponent implements OnInit, OnDestroy, AfterViewInit {
  public T: Traductor;
  ver: string = "";
  cargaFinalizada: boolean = false;
  servidorSaludable: boolean = false;
  servidorActivado: boolean = true;
  servidorRegistroDisponible: boolean = false;
  loginForm: FormGroup;
  showPassword = false;
  codigoActivacion: string = "";
  secondsLeft: number = 5000;

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

  ngAfterViewInit(): void {
    countdown$.subscribe(secondsLeft => {
      this.secondsLeft = secondsLeft;
      if(this.secondsLeft<=1){
        if(!environment.clouded) {
          this.hideCaptcha();
        }
      }
    });
  }

  ngOnInit(): void {

   
  }

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
    this.servidorActivado = true;
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

  ngOnDestroy() {
    if(environment.clouded) {
      this.hideCaptcha();
    }
  }


  hideCaptcha() {
    let element = document.getElementsByClassName("grecaptcha-badge");
    element[0].setAttribute("id", "grecaptcha_badge");
    document.getElementById("grecaptcha_badge").style.display = "none";
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
