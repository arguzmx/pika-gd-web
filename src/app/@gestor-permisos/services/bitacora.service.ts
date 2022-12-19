import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AsyncSubject, Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { Aplicacion } from '../../@pika/seguridad';
import { EventoAuditoriaActivo } from '../../@pika/seguridad/evento-auditoria-activo';
import { AppConfig } from '../../app-config';
import { AppLogService } from '../../services/app-log/app-log.service';

@Injectable({
  providedIn: 'root'
})
export class BitacoraService {

  constructor(
    private app: AppConfig,
    private http: HttpClient,
    private applog: AppLogService,
    private ts: TranslateService,
  ) { }

  private CrearEndpoint(sufijo: string): string {
    return this.app.config.apiUrl.replace(/\/$/, '') + '/' + sufijo;
  }

  
  public ObtenerApp(): Observable<Aplicacion[]> {
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

  public ObtenerAuditables(): Observable<EventoAuditoriaActivo[]> {
    const appsubject = new AsyncSubject<EventoAuditoriaActivo[]>();
    const url = this.CrearEndpoint('sistema/seguridad/eventosauditoria');

    this.http
      .get<EventoAuditoriaActivo[]>(url)
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

  public ActualizarAuditables(eventos: EventoAuditoriaActivo[]): Observable<any> {
    const appsubject = new AsyncSubject<any>();
    const url = this.CrearEndpoint('sistema/seguridad/eventosauditoria');

    this.http
      .post(url, eventos)
      .pipe(first())
      .subscribe(
        (aplicaciones) => {

        },
        (error) => {
          appsubject.next([]);
        },
        () => {
          appsubject.complete();
        });
    return appsubject;
  }

}
