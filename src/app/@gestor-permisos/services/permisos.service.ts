import { AppConfig } from './../../app-config';
import { first } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponseBase } from '@angular/common/http';
import { Observable, AsyncSubject, BehaviorSubject } from 'rxjs';
import { Aplicacion, PermisoAplicacion, Rol, TraduccionEntidad, RespuestaPermisos } from '../../@pika/pika-module';
import { FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { AppLogService } from '../../services/app-log/app-log.service';

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
  private subjectPermisoAplicacion = new BehaviorSubject<{ aplicacionId: string, tipo: PermisosEnum }>(null);
  private subjectPermisosModuloAplicacion = new BehaviorSubject<PermisoAplicacion[]>(null);
  private subjectFormPermisos = new BehaviorSubject<FormGroup>(null);

  private roles: Rol[] = null;
  constructor(
    private app: AppConfig,
    private http: HttpClient,
    private applog: AppLogService,
    private ts: TranslateService,
  ) { }

  private CrearEndpoint(sufijo: string): string {
    return this.app.config.apiUrl.replace(/\/$/, '') + '/' + sufijo;
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

  public ObtenerUsuarios(filtro): Observable<{ Id: string, Texto: string, Indice: number }[]> {
    const usuarioSubject = new AsyncSubject<{ Id: string, Texto: string, Indice: number }[]>();
    const url = this.CrearEndpoint(
      'seguridad/usuarios/pares?i=0&t=5&f[0][p]=Texto&f[0][o]=starts&f[0][v]=' + filtro);

    this.http
      .get<{ Id: string, Texto: string, Indice: number }[]>(url)
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

  public ObtenerPermisos(tipo: string, id: string): Observable<RespuestaPermisos> {
    const permisosSubject = new AsyncSubject<RespuestaPermisos>();
    const url = this.CrearEndpoint('sistema/seguridad/permisos/' + tipo + '/' + id);
    this.http
      .get<RespuestaPermisos>(url)
      .pipe(first())
      .subscribe(
        (respuesta) => {
          const actualizada: RespuestaPermisos = {
            Id: respuesta.Id,
            EsAdmmin: respuesta.EsAdmmin,
            Permisos: [] 
          }

          
          respuesta.Permisos.forEach(p => {
            const m = { ...p };
            m.ModuloId = `${p.AplicacionId}-${p.ModuloId}`;
            actualizada.Permisos.push(m);
          });
          permisosSubject.next(actualizada);
        },
        (error) => permisosSubject.next(null),
        () => permisosSubject.complete(),
      );

    return permisosSubject;
  }

  public GuardaPermisos(): Observable<string> {
    const resultSubject = new AsyncSubject<string>();
    const url = this.CrearEndpoint('sistema/seguridad/permisos/aplicar');
    const  permisosPost = [];

    // Separa el estado para enviar el id de aplciación y del módulo por separado
    // no eliminar
    this.subjectPermisosModuloAplicacion.value.forEach(p => {
      const nuevop = {...p};
      nuevop.ModuloId = nuevop.ModuloId.replace(`${nuevop.AplicacionId}-`, '');
      permisosPost.push(nuevop);
    });

    this.http.post<string>(url, this.FiltraPermisosModulo(permisosPost))
      .pipe(first())
      .subscribe(result => {
        resultSubject.next(result);
        this.applog.ExitoT('editor-pika.mensajes.ok-entidad-add', null, { nombre: 'Permisos' });
      },
        error => {
          this.handleHTTPError(error, 'permisos', '');
          resultSubject.next(null);
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
      if (p.Escribir || p.Leer || p.Eliminar || p.Ejecutar || p.Admin || p.NegarAcceso)
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
        resultSubject.next(result);
      },
        error => {
          resultSubject.next(null);
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
      Mascara: 0,
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

  public EstableceFormPermisosEntidad(form: FormGroup) {
    this.subjectFormPermisos.next(form);
  }

  public ObtieneFormPermisosEntidad() {
    return this.subjectFormPermisos.asObservable();
  }


  // Proces alos errores de API
  private handleHTTPError(error: Error, modulo: string, nombreEntidad: string): void {
    if (error instanceof HttpResponseBase) {
      if (error.status === 401) {
        // this.router.navigate(['/acceso/login']);
      } else {
        this.MuestraErrorHttp(error, modulo, nombreEntidad);
      }
    }
  }

  private MuestraErrorHttp(error: Error, modulo: string, nombreEntidad: string): void {
    const traducciones: string[] = [];
    traducciones.push('entidades.' + modulo);

    this.ts.get(traducciones)
      .pipe(first())
      .subscribe(t => {

        let trad: TraduccionEntidad = null;
        if ((t['entidades.' + modulo] !== 'entidades.' + modulo)
          && t['entidades.' + modulo].indexOf('|') > 0) {
          trad = new TraduccionEntidad(t['entidades.' + modulo]);
        } else {
          trad = new TraduccionEntidad(modulo + '|' + modulo + 's|' + '|');
        }

        if (error instanceof HttpResponseBase) {
          switch (error.status) {

            case 400:
              this.applog.FallaT('editor-pika.mensajes.err-datos-erroneos', null,
                { entidad: trad.singular, prefijo: trad.prefijoSingular });
              break;

            case 404:
              this.applog.FallaT('editor-pika.mensajes.err-datos-noexiste', null,
                { entidad: trad.singular, prefijo: trad.prefijoSingular });
              break;

            case 409:
              this.applog.FallaT('editor-pika.mensajes.err-datos-conflicto', null,
                { entidad: trad.singular, prefijo: trad.prefijoSingular });
              break;

            case 500:
              this.applog.FallaT('editor-pika.mensajes.err-datos-servidor', null,
                { entidad: trad.singular, prefijo: trad.prefijoSingular, error: error.statusText });
              break;
          }
        }
      });

  }

}

