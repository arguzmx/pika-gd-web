import { AppEventBus } from './../../../@pika/state/app-event-bus';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { EventoAplicacion } from '../../../@pika/eventos/evento-aplicacion';
import { NbDialogService } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';
import { Traductor } from '../../../@editor-entidades/editor-entidades.module';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiConfiguracion } from '../../services/api-configuracion';
import { first } from 'rxjs/operators';
import { AppLogService } from '../../../services/app-log/app-log.service';

@Component({
  selector: 'ngx-cambiar-contrasena',
  templateUrl: './cambiar-contrasena.component.html',
  styleUrls: ['./cambiar-contrasena.component.scss'],
  providers: [ApiConfiguracion]
})
export class CambiarContrasenaComponent implements OnInit {
  @ViewChild('dialogCambiarContrasena', { static: true }) dialogLinks: TemplateRef<any>;
  public T: Traductor;
  private dialogPassPickRef: any;
  private evento: EventoAplicacion;
  passwordForm: FormGroup;
  propsForm: FormGroup;
  showPassword = false;

  constructor(
    ts: TranslateService,
    private applog: AppLogService,
    private dialogService: NbDialogService,
    private appEventBus: AppEventBus,
    formBuilder: FormBuilder,
    private api: ApiConfiguracion) { 
      this.T = new Traductor(ts);
      this.passwordForm = formBuilder.group({
        inputNewPass: ['', [Validators.required, Validators.minLength(6)]],
        inputConfirmPass: ['', [Validators.required, Validators.minLength(6)]]
      });
    }

  ngOnInit(): void {
    this.CargaTraducciones();
    this.appEventBus.LeeEventos().subscribe(ev=> {
      this.ProcesaElementos(ev);
    });
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  private CargaTraducciones() {
    this.T.ts = ['ui.cancelar', 'ui.contrasena-cambiar', 'ui.establecer',
  'ui.contrasena-nueva', 'ui.contrasena-confirmar', 'ui.contrasena-nueva-ph', 'ui.contrasena-confirmar-ph'];
    this.T.ObtenerTraducciones();
  }

  private ProcesaElementos(ev: EventoAplicacion): void {
    this.evento = ev;
    if (ev.tema=='cambiarcontrasena') {
      this.dialogPassPickRef = this.dialogService
      .open(this.dialogLinks, { context: '' });
  
    }
  }

  getInputType() {
    if (this.showPassword) {
      return 'text';
    }
    return 'password';
  }

  onPasswordSet() {
    if (this.passwordForm.get('inputNewPass').value != this.passwordForm.get('inputConfirmPass').value) {
      this.applog.AdvertenciaT('ui.contrasena-camparacion-warning')
    } else {
      this.api.ActualizaContrasenaUsuario(this.evento.id, this.passwordForm.get('inputNewPass').value)
      .pipe(first()).subscribe(r=> {
        this.errorContrasena(0);
        this.dialogPassPickRef.close();
        this.limpiaFormaContrasena();
      }, (err) => { this.errorContrasena(parseInt(err.status));   });
    }
  }

  errorContrasena(err: number) {
    switch (err) {
      case 0:
        this.applog.ExitoT('ui.contrasena-cambio-ok');
        break;
      case 400:
        this.applog.AdvertenciaT('ui.contrasena-valida-warning')
        break;
      case 409:
        this.applog.AdvertenciaT('ui.contrasena-cambio-nocoincide')
        break;        
      default:
        this.applog.FallaT('ui.contrasena-cambio-err')
        break;
    }
  }

  limpiaFormaContrasena() {
    this.passwordForm.reset();
  }

}
