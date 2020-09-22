import { environment } from './../../../environments/environment.prod';
import { first } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, AsyncSubject, BehaviorSubject } from 'rxjs';
import { Aplicacion, PermisoAplicacion, Rol } from '../../@pika/pika-module';
import { FormGroup } from '@angular/forms';

export enum PermisosEnum {
  leer = 0,
  escribir = 1,
  eliminar = 2,
  administrar = 3,
  ejecutar = 4,
  denegar = 5,
}

export enum TipoEntidadEnum {
  rol = 'R',
  usuario = 'U',
}

@Injectable()
export class PermisosService {
  private subjectRolSeleccionadoId = new BehaviorSubject<string>(null);
  private subjectPermisoAplicacion = new BehaviorSubject<{aplicacionId: string, tipo: PermisosEnum}>(null);
  private subjectPermisosModuloAplicacion = new BehaviorSubject<PermisoAplicacion[]>(null);
  private subjectFormPermisos = new BehaviorSubject<FormGroup>(null);

  private roles: Rol[] = null;
  constructor(private http: HttpClient) {}

  private CrearEndpoint(sufijo: string): string {
    return environment.apiUrl.replace(/\/$/, '') + '/' + sufijo;
  }

  public ObtenerAplicaciones(): Observable<Aplicacion[]> {
    const appsubject = new AsyncSubject<Aplicacion[]>();
    const url = this.CrearEndpoint('sistema/seguridad/aplicaciones');

    this.http
      .get<Aplicacion[]>(url)
      .pipe(first())
      .subscribe(
        (aplicaciones) => {
          appsubject.next(aplicaciones);
        },
        (error) => {
          appsubject.next([]);
        },
        () => {
          appsubject.complete();
        });
    return appsubject;
  }

  public ObtenerRoles(): Observable<Rol[]> {
    const rolsubject = new AsyncSubject<Rol[]>();
    const url = this.CrearEndpoint('org/rol/todos');

    this.http
      .get<Rol[]>(url)
      .pipe(first())
      .subscribe(
        (roles) => {
          if (roles.length > 0) {
            this.roles = roles;
            this.subjectRolSeleccionadoId.next(this.roles[0].Id);
            rolsubject.next(roles);
          }
        },
        (error) => rolsubject.next([]),
        () => rolsubject.complete(),
      );
    return rolsubject;
  }

  public ObtenerUsuarios(filtro): Observable<{Id: string, Texto: string, Indice: number}[]> {
    const usuarioSubject = new AsyncSubject<{Id: string, Texto: string, Indice: number}[]>();
    const url = this.CrearEndpoint(
      'seguridad/usuarios/pares?i=0&t=5&f[0][p]=Texto&f[0][o]=starts&f[0][v]=' + filtro);

    this.http
      .get<{Id: string, Texto: string, Indice: number}[]>(url)
      .pipe(first())
      .subscribe(
        (usuarios) => {
          usuarioSubject.next(usuarios);
        },
        (error) => usuarioSubject.next(null),
        () => usuarioSubject.complete(),
      );

    return usuarioSubject;
  }

  public ObtenerPermisos(tipo: string, id: string): Observable<PermisoAplicacion[]> {
    const permisosSubject = new AsyncSubject<PermisoAplicacion[]>();
    const url = this.CrearEndpoint('sistema/seguridad/permisos/' + tipo + '/' + id);
    this.http
      .get<PermisoAplicacion[]>(url)
      .pipe(first())
      .subscribe(
        (permisos) => {
          permisosSubject.next(permisos);
        },
        (error) => permisosSubject.next([]),
        () => permisosSubject.complete()
      );

    return permisosSubject;
  }

  public GuardaPermisos(): Observable<string> {
    const resultSubject = new AsyncSubject<string>();
    const url = this.CrearEndpoint('sistema/seguridad/permisos/aplicar');

    this.http.post<string>(url, this.FiltraPermisosModulo(this.subjectPermisosModuloAplicacion.value))
    .pipe(first())
    .subscribe(result => {
      console.log(result);
      resultSubject.next(result);
    },
    error => {
      resultSubject.next('');
    },
    () => {
      resultSubject.complete();
    });


    return resultSubject;
  }

  private FiltraPermisosModulo(permisos: PermisoAplicacion[]): PermisoAplicacion[] {
    const permisosGuardados: PermisoAplicacion[] = [];
    const permisosEliminados: PermisoAplicacion[] = [];
    permisos.forEach(p => {
      if (p.Escribir || p.Leer || p.Eliminar || p.Ejecutar || p.Admin || p.NegarAcceso )
        permisosGuardados.push(p);
      else
        permisosEliminados.push(p);
    });

    if (permisosEliminados.length > 0) this.EliminaPermisos(permisosEliminados);
    return permisosGuardados;
  }

  private EliminaPermisos(permisos: PermisoAplicacion[]): Observable<string> {
    const resultSubject = new AsyncSubject<string>();
    const url = this.CrearEndpoint('sistema/seguridad/permisos/eliminar');

    this.http.post<string>(url, permisos)
    .pipe(first())
    .subscribe(result => {
      console.log(result);
      resultSubject.next(result);
    },
    error => {
      resultSubject.next('');
    },
    () => {
      resultSubject.complete();
    });

    return resultSubject;
  }

  public CreaPermisoApp(): PermisoAplicacion {
    const p = {
      DominioId: '',
      AplicacionId: '',
      ModuloId: '',
      TipoEntidadAcceso: '',
      EntidadAccesoId: '',
      NegarAcceso: false,
      Leer: false,
      Escribir: false,
      Eliminar: false,
      Admin: false,
      Ejecutar: false,
    };
    return p;

  }

  public EstablecePermisoAplicacion(aplicacionId, tipoPermiso: PermisosEnum) {
    this.subjectPermisoAplicacion.next({ aplicacionId: aplicacionId, tipo: tipoPermiso });
  }

  public ObtienePermisoAplicacion() {
    return this.subjectPermisoAplicacion.asObservable();
  }

  public EstablecePermisosModulo(permisos: PermisoAplicacion[]) {
    this.subjectPermisosModuloAplicacion.next(permisos);
  }

  public ObtienePermisosModulo() {
    return this.subjectPermisosModuloAplicacion.asObservable();
  }

  public EstableceFormPermisosEntidad(form: FormGroup){
    this.subjectFormPermisos.next(form);
  }

  public ObtieneFormPermisosEntidad() {
    return this.subjectFormPermisos.asObservable();
  }

}

