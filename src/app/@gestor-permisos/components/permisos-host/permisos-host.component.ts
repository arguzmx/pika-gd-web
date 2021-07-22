import { PermisosService, TipoEntidadEnum } from './../../services/permisos.service';
import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { Aplicacion, Rol, PermisoAplicacion, RespuestaPermisos, AppLogService } from '../../../@pika/pika-module';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Traductor } from '../../../@editor-entidades/editor-entidades.module';


@Component({
  selector: 'ngx-permisos-host',
  templateUrl: './permisos-host.component.html',
  styleUrls: ['./permisos-host.component.scss'],
  providers: [PermisosService],
})
export class PermisosHostComponent implements OnInit, OnDestroy {
  @Output() CapturaFinalizada = new EventEmitter();

  public aplicaciones: Aplicacion[] = [];
  public roles: Rol[] = [];
  public usuarios: { Id: string, Texto: string, Indice: number }[] = [];
  public permisosEntidad: PermisoAplicacion[];
  public permisosUI: PermisoAplicacion[] = [];
  public EsAdmin: boolean = false;
  private respuestaPermisos: RespuestaPermisos;
  public T: Traductor;
  
  tipoEntidadSeleccionada: TipoEntidadEnum;
  entidadSeleccionadaId: string = '';
  textoEntidadSeleccionada: string = '';

  focusInput: boolean = false;
  limpiarPermisosApp: boolean = false; // **
  formPermisosEntidad = new FormGroup({});

  private onDestroy$: Subject<void> = new Subject<void>();
  constructor(
    private applog: AppLogService,
    private servicioPermisos: PermisosService, 
    ts: TranslateService,
    ) {
      this.T = new Traductor(ts);
     }

    private CargaTraducciones() {
      this.T.ts = [
        'ui.regresar',
        'permisos.nombre','permisos.obtenidos','permisos.obtenidos-0',
        'permisos.guardar', 'permisos.todos', 'permisos.ninguno', 'permisos.buscar-u',
        'permisos.usuarios','permisos.roles','permisos.ninguno'];
      this.T.ObtenerTraducciones();
    }     

  ngOnInit(): void {
    this.ObtieneAplicaciones();
    this.ObtieneRoles();
    this.CargaTraducciones();
  }

  ngOnDestroy(): void {
    this.onDestroy$.next(null);
    this.onDestroy$.complete();
  }

  ObtieneAplicaciones(): void {
    this.servicioPermisos.ObtenerAplicaciones()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(apps => {
        this.aplicaciones = apps;
      });
  }

  ObtieneRoles(): void {
    this.servicioPermisos.ObtenerRoles()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(roles => {
        this.roles = roles ?? [];
        this.tipoEntidadSeleccionada = TipoEntidadEnum.rol;
        this.entidadSeleccionadaId = roles[0].Id;
        this.textoEntidadSeleccionada = roles[0].Nombre;
        this.ObtienePermisosEntidad();
      }, (err) => { console.error(err) });
  }

  ObtieneUsuarios(filtro): void {
    this.servicioPermisos.ObtenerUsuarios(filtro)
      .subscribe(usuarios => {
        if (usuarios) {
          usuarios.forEach(x => x.Texto = x.Texto.split(' ')[2]
            + ' ' + x.Texto.split(' ')[1] + ' ' + x.Texto.split(' ')[0]);
          this.usuarios = usuarios;
        } else {
          this.usuarios = [];
        }
      }, (err) => { console.error(err) });
  }

  GuardaPermisos() {
    this.servicioPermisos.GuardaPermisos();
  }

  MarcaTodos() {
    this.permisosUI.forEach(p => {
      p.NegarAcceso = false;
      p.Leer = true;
      p.Escribir = true;
      p.Eliminar = true;
      p.Ejecutar = true;
      p.Admin = true;
    });
    this.servicioPermisos.EstablecePermisosModulo(this.permisosUI);
  }

  DesmarcaTodos() {
    this.permisosUI.forEach(p => {
      p.Leer = false;
      p.Escribir = false;
      p.Eliminar = false;
      p.Ejecutar = false;
      p.Admin = false;
      p.NegarAcceso = false;
    });
    this.servicioPermisos.EstablecePermisosModulo(this.permisosUI);
  }

  ActualizaPermisosEntidad(entidadId) {
    this.EstableceEntidad(entidadId);
  }

  // Crea una coleccion de tipo PermisoAplicacion[] con los módulos de cada aplicación
  // en la cuál se actualizan los permisos a guardar
  CreaPermisosModulo() {
    this.permisosUI = [];
    if (this.aplicaciones.length > 0) {
      this.aplicaciones.forEach(app => {
        if (app.Modulos.length > 0) {
          app.Modulos.forEach(mod => {
            const p = this.servicioPermisos.CreaPermisoApp();
            p.DominioId = '';  // el identiicador del dominio se lee en el backend desde los headers
            p.TipoEntidadAcceso = this.tipoEntidadSeleccionada;
            p.AplicacionId = app.Id;
            p.ModuloId = mod.Id;
            p.EntidadAccesoId = this.entidadSeleccionadaId;

            if (this.respuestaPermisos.EsAdmmin) {
              p.NegarAcceso = false;
              p.Leer = true;
              p.Escribir = true;
              p.Eliminar = true;
              p.Admin = true;
              p.Ejecutar = true;
            } else {
              const permisoDb = this.permisosEntidad.find(x => x.AplicacionId === p.AplicacionId &&
                x.ModuloId === p.ModuloId);

              if (permisoDb) {
                if (permisoDb.NegarAcceso) {
                  permisoDb.Leer = false;
                  permisoDb.Escribir = false;
                  permisoDb.Eliminar = false;
                  permisoDb.Admin = false;
                  permisoDb.Ejecutar = false;
                }
                p.NegarAcceso = permisoDb.NegarAcceso;
                p.Leer = permisoDb.Leer;
                p.Escribir = permisoDb.Escribir;
                p.Eliminar = permisoDb.Eliminar;
                p.Admin = permisoDb.Admin;
                p.Ejecutar = permisoDb.Ejecutar;
              }
            }
            this.permisosUI.push(p);
          });
        }
      });
    }
  }

  EstableceEntidad(entidadId): void {

    this.entidadSeleccionadaId = entidadId;

    var rol = null;
    if (this.roles) {
      rol = this.roles.find(x => x.Id === this.entidadSeleccionadaId);
    }

    if (rol != null) {
      this.tipoEntidadSeleccionada = TipoEntidadEnum.rol;
      this.textoEntidadSeleccionada = rol.Nombre;
    } else {
      this.tipoEntidadSeleccionada = TipoEntidadEnum.usuario;
      this.textoEntidadSeleccionada = this.usuarios.find(x => x.Id === this.entidadSeleccionadaId).Texto.split(' ')[0];
    }
    this.ObtienePermisosEntidad();
    // evt.target.value = this.textoEntidadSeleccionada;
    // this.focusInput = false;
  }


  ObtienePermisosEntidad(): void {
    this.servicioPermisos.ObtenerPermisos(this.tipoEntidadSeleccionada, this.entidadSeleccionadaId)
      .subscribe(respuesta => {
        console.log(respuesta);

        if(respuesta.Permisos.length == 0) {
          this.applog.AdvertenciaT('permisos.obtenidos-0');
        } else {
          this.applog.AdvertenciaT('permisos.obtenidos');
        }

        this.permisosEntidad = respuesta.Permisos;
        this.EsAdmin = respuesta.EsAdmmin;
        this.respuestaPermisos = respuesta;
        this.CreaPermisosModulo();
        this.servicioPermisos.EstablecePermisosModulo(this.permisosUI);
      }, (err) => {

      });
  }

}
