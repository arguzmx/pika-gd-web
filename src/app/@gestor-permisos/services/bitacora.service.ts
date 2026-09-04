import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AsyncSubject, Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { Paginado } from '../../@pika/consulta';
import { Aplicacion } from '../../@pika/seguridad';
import { EventoAuditoriaActivo } from '../../@pika/seguridad/evento-auditoria-activo';
import { AppConfig } from '../../app-config';
import { AppLogService } from '../../services/app-log/app-log.service';
import { EventoAuditoria } from '../modelos/evento-auditoria';
import { QueryBitacora } from '../modelos/query-bitacora';

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
  
  public UsuariosPorIds(IdsCsv: string): Observable<any> {
    const appsubject = new AsyncSubject<any>();
    const url = this.CrearEndpoint(`seguridad/usuarios/pares/${IdsCsv}`);

    this.http
      .get(url)
      .pipe(first())
      .subscribe(
        (usuarios) => {
          appsubject.next(usuarios);
        },
        (error) => {
          appsubject.next([]);
        },
        () => {
          appsubject.complete();
        });
    return appsubject;
  }

  public UsuariosDominio(): Observable<any> {
    const appsubject = new AsyncSubject<any>();
    const url = this.CrearEndpoint('sistema/seguridad/usuarios/pares');

    this.http
      .get(url)
      .pipe(first())
      .subscribe(
        (usuarios) => {
          appsubject.next(usuarios);
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


  public QueryEventos(query: QueryBitacora): Observable<Paginado<EventoAuditoria>> {
    const appsubject = new AsyncSubject<any>();
    const url = this.CrearEndpoint('sistema/seguridad/eventosauditoria/buscar');

    this.http
      .post(url, query)
      .pipe(first())
      .subscribe(
        (eventos) => {
          appsubject.next(eventos);
        },
        (error) => {
          appsubject.next(null);
        },
        () => {
          appsubject.complete();
        });
    return appsubject;
  }

}
