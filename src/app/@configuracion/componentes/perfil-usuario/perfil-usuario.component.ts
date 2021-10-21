import { first } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms'
import { TranslateService } from '@ngx-translate/core';
import { Traductor } from '../../../@editor-entidades/editor-entidades.module';
import { AppLogService } from '../../../@pika/servicios';
import { ApiConfiguracion } from '../../services/api-configuracion';

@Component({
  selector: 'ngx-perfil-usuario',
  templateUrl: './perfil-usuario.component.html',
  styleUrls: ['./perfil-usuario.component.scss'],
  providers: [ApiConfiguracion],
})
export class PerfilUsuarioComponent implements OnInit {

  passwordForm: FormGroup;
  public T: Traductor;

  constructor(
    formBuilder: FormBuilder,
    ts: TranslateService,
    private applog: AppLogService,
    private api: ApiConfiguracion
  ) {

    this.T = new Traductor(ts);

    this.passwordForm = formBuilder.group({
      inputActPass: ['', [Validators.required, Validators.minLength(4)]],
      inputNewPass: ['', [Validators.required, Validators.minLength(4)]],
      inputConfirmPass: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  ngOnInit(): void {
    this.CargaTraducciones();    
  }

  private CargaTraducciones() {
    this.T.ts = [
      'ui.contrasena',
      'ui.establecer',
      'ui.contrasena-actual',
      'ui.contrasena-nueva',
      'ui.contrasena-confirmar',
      'ui.contrasena-actual-ph',
      'ui.contrasena-nueva-ph',
      'ui.contrasena-confirmar-ph',
      'ui.contrasena-cambiar'
    ];
    this.T.ObtenerTraducciones();
  }

  showPassword = false;

  getInputType() {
    if (this.showPassword) {
      return 'text';
    }
    return 'password';
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }


  onPasswordSet() {
    if (this.passwordForm.get("inputNewPass").value != this.passwordForm.get("inputConfirmPass").value) {
      this.applog.AdvertenciaT('ui.contrasena-camparacion-warning')
    } {
      this.api.ActualizaContrasena(this.passwordForm.get("inputActPass").value, this.passwordForm.get("inputNewPass").value)
      .pipe(first()).subscribe(r=> {
        this.errorContrasena(0);
        this.limpiaFormaContrasena();
      }, (err) => { this.errorContrasena(parseInt(err.status));   });
    }
  }

  limpiaFormaContrasena() {
      this.passwordForm.reset();
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

}
