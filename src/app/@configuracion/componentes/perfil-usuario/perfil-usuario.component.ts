import { PropiedadesUsuario } from './../../model/propiedades-usuario';
import { first } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms'
import { TranslateService } from '@ngx-translate/core';
import { Traductor } from '../../../@editor-entidades/editor-entidades.module';
import { AppLogService } from '../../../@pika/servicios';
import { ApiConfiguracion } from '../../services/api-configuracion';
import { forkJoin } from 'rxjs';
import { ValorListaOrdenada } from '../../../@pika/metadata';

@Component({
  selector: 'ngx-perfil-usuario',
  templateUrl: './perfil-usuario.component.html',
  styleUrls: ['./perfil-usuario.component.scss'],
  providers: [ApiConfiguracion],
})
export class PerfilUsuarioComponent implements OnInit {

  passwordForm: FormGroup;
  propsForm: FormGroup;
  zonasHorarias: ValorListaOrdenada[] = [];
  paises: ValorListaOrdenada[] = [];
  estados: ValorListaOrdenada[] = [];
  generos: ValorListaOrdenada[] = [];
  usuario: PropiedadesUsuario = null;
  showPassword = false;

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

    this.propsForm = formBuilder.group({
      propnombre: ['', [Validators.required, Validators.minLength(4)]],
      propapellidop: ['', [Validators.required, Validators.minLength(4)]],
      propapellidom: [''],
      propiniciales: [''],
      propnickname: ['', [Validators.required, Validators.minLength(4)]],
      propgenero: [''],
      proppais: [''],
      propestado: [''],
      propzone: [''],
    });

  }

  private SetValoresUsuario() {
    this.propsForm.get('propnombre').setValue(this.usuario.name || '');
    this.propsForm.get('propapellidop').setValue(this.usuario.family_name || '');
    this.propsForm.get('propapellidom').setValue(this.usuario.given_name || '');
    this.propsForm.get('propiniciales').setValue(this.usuario.middle_name || '');
    this.propsForm.get('propnickname').setValue(this.usuario.nickname || '');
    this.propsForm.get('propgenero').setValue(this.usuario.generoid || '');
    this.propsForm.get('proppais').setValue(this.usuario.PaisId || '');
    this.propsForm.get('propestado').setValue(this.usuario.EstadoId || '');
    this.propsForm.get('propzone').setValue(this.usuario.gmt || '');
  }

  ngOnInit(): void {
    this.CargaTraducciones();    
    this.DatosIniciales();
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
      'ui.contrasena-cambiar',
      'ui.usuario-actualizar',
      'ui.actualizar',
      'ui.usuario-actualizar',
      'ui.usuario-actualizar-nombre',
      'ui.usuario-actualizar-apellidop',
      'ui.usuario-actualizar-apellidom',
      'ui.usuario-actualizar-iniciales',
      'ui.usuario-actualizar-nickname',
      'ui.usuario-actualizar-genero',
      'ui.usuario-actualizar-pais',
      'ui.usuario-actualizar-estado',
      'ui.usuario-actualizar-zone',
      'titulo.perfil-usuario'
    ];
    this.T.ObtenerTraducciones();
  }

  private DatosIniciales() {

    this.estados = [];
    const usuario = this.api.ObtieneUsuario().pipe(first());
    const zonashorarias = this.api.ObtieneZonasHorarias().pipe(first());
    const paises = this.api.ObtienePaises().pipe(first());
    const generos = this.api.ObtieneGeneros().pipe(first());

    forkJoin([usuario, zonashorarias, paises, generos]).subscribe(resultados => {
      this.usuario = resultados [0];
      this.zonasHorarias = resultados[1];
      this.paises = resultados [2];
      this.generos = resultados[3];
      this.usuario.PaisId == this.usuario.PaisId || 'MEX';
      this.ObtieneEstados(this.usuario.PaisId);
      this.SetValoresUsuario();
    });
    
  }


  getInputType() {
    if (this.showPassword) {
      return 'text';
    }
    return 'password';
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  onUsuarioUpdate() {
    const tmp = {...this.usuario};
    tmp.name = this.propsForm.get('propnombre').value;
    tmp.family_name = this.propsForm.get('propapellidop').value;
    tmp.given_name =this.propsForm.get('propapellidom').value;
    tmp.middle_name =this.propsForm.get('propiniciales').value;
    tmp.nickname =this.propsForm.get('propnickname').value;
    tmp.generoid =this.propsForm.get('propgenero').value ?? this.usuario.generoid;
    tmp.PaisId =this.propsForm.get('proppais').value ?? this.usuario.PaisId;
    tmp.EstadoId =this.propsForm.get('propestado').value ?? this.usuario.EstadoId;
    tmp.gmt =this.propsForm.get('propzone').value ?? this.usuario.gmt;

    this.api.ActualizaUsuario(tmp)
      .pipe(first()).subscribe(r=> {
        this.errorUsuario(0);
      }, (err) => { this.errorUsuario(parseInt(err.status));   });

  }


  private ObtieneEstados(paisId: string ) {
    this.api.ObtieneEstados(paisId).pipe(first()).subscribe(e => {
      this.estados = e;
    });
  }

  onPasswordSet() {
    if (this.passwordForm.get('inputNewPass').value != this.passwordForm.get('inputConfirmPass').value) {
      this.applog.AdvertenciaT('ui.contrasena-camparacion-warning')
    } {
      this.api.ActualizaContrasena(this.passwordForm.get('inputActPass').value, this.passwordForm.get('inputNewPass').value)
      .pipe(first()).subscribe(r=> {
        this.errorContrasena(0);
        this.limpiaFormaContrasena();
      }, (err) => { this.errorContrasena(parseInt(err.status));   });
    }
  }

  limpiaFormaContrasena() {
    this.passwordForm.reset();
  }

  nuevoPais($event: string) {
    this.propsForm.get('proppais').setValue($event);
    this.propsForm.get('propestado').setValue('');
    this.ObtieneEstados($event);
  }

  nuevoEstado($event: string) {
    this.propsForm.get('propestado').setValue($event);
  }

  errorUsuario(err: number) {
    switch (err) {
      case 0:
        this.applog.ExitoT('ui.usuario-actualizar-ok');
        break;
      // case 400:
      //   this.applog.AdvertenciaT('ui.contrasena-valida-warning')
      //   break;
      // case 409:
      //   this.applog.AdvertenciaT('ui.contrasena-cambio-nocoincide')
      //   break;        
      default:
        this.applog.FallaT('ui.usuario-actualizar-err')
        break;
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

}
