import { AppConfig } from './../../app-config';
import { first } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponseBase } from '@angular/common/http';
import { Observable, AsyncSubject, BehaviorSubject } from 'rxjs';
import { Aplicacion, PermisoAplicacion, Rol, AppLogService, TraduccionEntidad, RespuestaPermisos } from '../../@pika/pika-module';
import { FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';


@Injectable()
export class ApiConfiguracion {
  private subjectRolSeleccionadoId = new BehaviorSubject<string>(null);


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


  public ActualizaContrasena(actual: string, nueva: string ){
    const url = this.CrearEndpoint('usuario/perfil/contrasena/actualizar');  
    return this.http
    .post(url, { Actual: actual, Nueva: nueva});
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

