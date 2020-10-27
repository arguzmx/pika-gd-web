import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpRequest,
  HttpEventType,
  HttpResponse,
   HttpResponseBase,
} from '@angular/common/http';
import { Subject, Observable, of, from, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { IUploadConfig } from './model/i-upload-config';
import { first, mergeMap } from 'rxjs/operators';
import { AppLogService, TraduccionEntidad } from '../@pika/pika-module';
import { TranslateService } from '@ngx-translate/core';
import { VisorImagenesService } from '../@visor-imagenes/services/visor-imagenes.service';
import { Pagina } from '../@visor-imagenes/model/pagina';

const url = environment.uploadUrl;

@Injectable()
export class UploadService {
  private indiceCarga: number;
  private subjectPaginas = new BehaviorSubject<Object>(null); // o uno desde el servicio de visor
  constructor(private http: HttpClient, private applog: AppLogService,
              private ts: TranslateService) {
    this.indiceCarga = 1;
  }

  public static NewGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0,
        v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  public config: IUploadConfig;

  public upload(files: any[] = []): { [key: string]:
      { progress: Observable<{progreso: number, status: number}> } } {
    files = files.filter(x => !x.subido);
    const status: { [key: string]: { progress: Observable<{progreso: number, status: number}> } } = {};
    let total: number = files.length;

    for (let i = total - 1; i >= 0; i--) {
      const file = files[i];
      this.indiceCarga++;
      const formData: FormData = new FormData();
      formData.append('VolumenId', this.config.VolumenId);
      formData.append('PuntoMontajeId', this.config.PuntoMontajeId);
      formData.append('ElementoId', this.config.ElementoId);
      formData.append('TransaccionId', this.config.TransactionId);
      formData.append('Indice', this.indiceCarga.toString());
      formData.append('VersionId', this.config.VersionId);
      formData.append('file', file, file.name);

      const req = new HttpRequest('POST', url, formData, {
        reportProgress: true,
        responseType: 'text',
      });

      const progress = new Subject<{progreso: number, status: number}>();
      this.http.request(req).subscribe((event) => {
        if (event.type === HttpEventType.UploadProgress) {
          const percentDone = Math.round((100 * event.loaded) / event.total);
          progress.next({progreso: percentDone, status: percentDone === 100 ? 200 : 0});
        } else if (event instanceof HttpResponse) {
          // console.log(event);
          progress.complete();
          total--;
          if (total === 0) {
            this.http
              .post(url + `/completar/${this.config.TransactionId}`, null)
              .pipe(first())
              .subscribe((result) => {
                this.subjectPaginas.next(result);
                if (result) this.applog.ExitoT('editor-pika.mensajes.msg-exito', null, {});
              });
          }
        }
      },
      error => {
        total--;
        progress.error({progreso: 0, status: error.status });
        this.handleHTTPError(error, file.name, '');
      });
      status[file.name] = {
          progress: progress.asObservable(),
        };
    }

    return status;
  }

  ObtienePaginas(): Observable<Object> {
    return this.subjectPaginas.asObservable();
  }
  
  // public ActualizaPaginas(){}
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
