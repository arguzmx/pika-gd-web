import { AppConfig } from './../../app-config';
import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpRequest,
  HttpEventType,
  HttpResponse,
  HttpResponseBase,
  HttpHeaders,
} from '@angular/common/http';
import { Subject, Observable } from 'rxjs';
import { filter, first, map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { SesionQuery, TraduccionEntidad } from '../../@pika/pika-module';
import { VisorImagenesService } from './visor-imagenes.service';
import { Pagina } from '../model/pagina';
import { IUploadConfig } from '../model/i-upload-config';
import { AppLogService } from '../../services/app-log/app-log.service';
import { TokenScanner } from '../model/scanner';




@Injectable()
export class UploadService {
  private indiceCarga: number;
  private url: string;

  public Posicion: number;
  public PosicionInicio: number;

  constructor(
    private app: AppConfig,
    private http: HttpClient,
    private applog: AppLogService,
    private ts: TranslateService,
    private servicioVisor: VisorImagenesService,
    private sessionQuery: SesionQuery) {
    this.indiceCarga = 1;
    this.url = this.app.config.uploadUrl;
    this.Posicion = 0;
    this.PosicionInicio = 0;
  }

  public static NewGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0,
        v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  public uConfig: IUploadConfig;


  public SetConfig(config: IUploadConfig) {
    this. uConfig = config;
  }

  public CreaTokenScanner(elementoId: string, versionId: string): Observable<TokenScanner>{
    const endpoint = this.url + `/scanner/token/${elementoId}/${versionId}`;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.sessionQuery.getJWT}`
    });

    const req = new HttpRequest('POST', endpoint, null, {
      headers,
      reportProgress: true,
      responseType: 'json',
    });

    return this.http.request<TokenScanner>(req).pipe(
      filter(event => event.type === HttpEventType.Response),
      map((event: HttpResponse<TokenScanner>) => event.body as TokenScanner)
    );
  }

  public upload(files: any[] = []): { [key: string]:
      { progress: Observable<{progreso: number, status: number}> } } {
    files = files.filter(x => !x.subido);
    const status: { [key: string]: { progress: Observable<{progreso: number, status: number}> } } = {};
    let total: number = files.length;
    this.servicioVisor.SetLeyendoPaginas(true);
    for (let i = total - 1; i >= 0; i--) {
      const file = files[i];
      this.indiceCarga++;
      const formData: FormData = new FormData();
      formData.append('VolumenId', this.uConfig.VolumenId);
      formData.append('PuntoMontajeId', this.uConfig.PuntoMontajeId);
      formData.append('ElementoId', this.uConfig.ElementoId);
      formData.append('TransaccionId', this.uConfig.TransactionId);
      formData.append('Indice', this.indiceCarga.toString());
      formData.append('Posicion', this.Posicion.toString());
      formData.append('PosicionInicio', this.PosicionInicio.toString());
      formData.append('VersionId', this.uConfig.VersionId);
      formData.append('file', file, file.name);

      const req = new HttpRequest('POST', this.url, formData, {
        reportProgress: true,
        responseType: 'text',
      });

      const progress = new Subject<{progreso: number, status: number}>();
      this.http.request(req).subscribe((event) => {
        // console.log(event);
        if (event.type === HttpEventType.UploadProgress) {
          const percentDone = Math.round((100 * event.loaded) / event.total);
          progress.next({progreso: percentDone, status: percentDone === 100 ? 200 : 0});
        } else if (event instanceof HttpResponse) {
          progress.complete();
          total--;
          if (total === 0) {
            this.http
              .post<Pagina[]>(this.url + `/completar/${this.uConfig.TransactionId}`, null)
              .pipe(first())
              .subscribe((paginasNuevas) => {
                if (paginasNuevas) {
                  this.servicioVisor.EstableceActualizarPaginas(paginasNuevas, this.uConfig.ElementoId);
                  this.applog.ExitoT('editor-pika.mensajes.msg-exito', null, {});
                }
                this.servicioVisor.SetLeyendoPaginas(false);
              }, (err) => {
                this.servicioVisor.SetLeyendoPaginas(false);
              });
          }
        }
      },
      error => {
        total--;
        progress.next({progreso: 0, status: error.status });
        this.handleHTTPError(error, file.name, '');
      });

      status[file.name] = {
        progress: progress.asObservable(),
      };
    }

    return status;
  }

    // Proces alos errores de API
    private handleHTTPError(error: Error, modulo: string, nombreEntidad: string ): void {
      if (error instanceof  HttpResponseBase) {
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
      .subscribe( t => {

        let trad: TraduccionEntidad =  null;
        if ((t['entidades.' + modulo] !== 'entidades.' + modulo)
          && t['entidades.' + modulo].indexOf('|') > 0 ) {
          trad = new TraduccionEntidad(t['entidades.' + modulo]);
        } else {
          trad = new TraduccionEntidad( modulo + '|' + modulo + 's|' + '|');
        }
        if (error instanceof  HttpResponseBase) {
          switch (error.status) {
            case 400:
                this.applog.FallaT('editor-pika.mensajes.err-datos-erroneos', null,
                { entidad: trad.singular, prefijo: trad.prefijoSingular  } );
                break;
            case 404:
                this.applog.FallaT('editor-pika.mensajes.err-datos-noexiste', null,
                { entidad: trad.singular, prefijo: trad.prefijoSingular  } );
                break;
            case 409:
                this.applog.FallaT('editor-pika.mensajes.err-datos-conflicto', null,
                { entidad: trad.singular, prefijo: trad.prefijoSingular  } );
                break;
              case 500:
                this.applog.FallaT('editor-pika.mensajes.err-datos-servidor', null,
                { entidad: trad.singular, prefijo: trad.prefijoSingular, error: error.statusText } );
                break;
          }
        }
      });
    }
}
