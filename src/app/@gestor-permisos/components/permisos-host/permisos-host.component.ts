import { PermisosService, TipoEntidadEnum } from './../../services/permisos.service';
import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { Aplicacion, Rol, PermisoAplicacion } from '../../../@pika/pika-module';
import { Subject } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';


@Component({
  selector: 'ngx-permisos-host',
  templateUrl: './permisos-host.component.html',
  styleUrls: ['./permisos-host.component.scss'],
  providers: [PermisosService],
})
export class PermisosHostComponent implements OnInit, OnDestroy {
  @Output() CapturaFinalizada = new EventEmitter();

  public aplicaciones: Aplicacion[];
  public roles: Rol[];
  public usuarios: {Id: string, Texto: string, Indice: number}[] = [];
  public permisosEntidad: PermisoAplicacion[];
  public permisosUI: PermisoAplicacion[] = [];

  tipoEntidadSeleccionada: TipoEntidadEnum;
  entidadSeleccionadaId: string = '';
  textoEntidadSeleccionada: string = '';

  focusInput: boolean = false;
  limpiarPermisosApp: boolean = false; // **
  formPermisosEntidad = new FormGroup({});

  private onDestroy$: Subject<void> = new Subject<void>();
  constructor(private servicioPermisos: PermisosService, private fb: FormBuilder) { }


  ngOnInit(): void {
    this.ObtieneAplicaciones();
    this.ObtieneRoles();
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
      this.roles = roles;
      this.tipoEntidadSeleccionada = TipoEntidadEnum.rol;
      this.entidadSeleccionadaId = roles[0].Id;
      this.textoEntidadSeleccionada = roles[0].Nombre;
      this.ObtienePermisosEntidad();
    });
  }

  ObtieneUsuarios(filtro): void {
    this.servicioPermisos.ObtenerUsuarios(filtro)
    .subscribe(usuarios => {
      usuarios.forEach(x => x.Texto = x.Texto.split(' ')[2]
                      + ' ' + x.Texto.split(' ')[1] + ' ' + x.Texto.split(' ')[0]);
      this.usuarios = usuarios;
    });
  }

  GuardaPermisos() {
    this.servicioPermisos.GuardaPermisos();
  }

  MarcaTodos() {
    this.permisosUI.forEach( p => {
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
    this.permisosUI.forEach( p => {
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
    this.entidadSeleccionadaId = entidadId;
    this.ObtienePermisosEntidad();
    this.EstableceTextoEntidad();
  }

  // -> ObtienePermisosEntidad()
  //    -> CreaPermisosModulo()
  ObtienePermisosEntidad(): void {

    this.servicioPermisos.ObtenerPermisos(this.tipoEntidadSeleccionada, this.entidadSeleccionadaId)
    .subscribe(permisos => {
      this.permisosEntidad = permisos;
      this.CreaPermisosModulo();
      this.servicioPermisos.EstablecePermisosModulo(this.permisosUI);
    });
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
            this.permisosUI.push(p);
          });
        }
      });
    }
  }

  EstableceTextoEntidad(evt?) {
    const rol = this.roles.find( x => x.Id === this.entidadSeleccionadaId);
    if (rol) {
      this.tipoEntidadSeleccionada = TipoEntidadEnum.rol;
      this.textoEntidadSeleccionada = rol.Nombre;
    }else {
      this.tipoEntidadSeleccionada = TipoEntidadEnum.usuario;
      this.textoEntidadSeleccionada = this.usuarios.find(x => x.Id === this.entidadSeleccionadaId).Texto.split(' ')[0];
    }

    if (evt) evt.target.value = this.textoEntidadSeleccionada;
    this.focusInput = false;
  }
}
