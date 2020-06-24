import { SesionQuery } from './../state/sesion.query';
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest,
    HttpHandler, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

    const HCULTURE: string = 'culture';
    const HUSUARIOID: string = 'uid';
    const HDOMINIOID: string = 'did';
    const HUNIDADORGID: string = 'tid';

@Injectable()
export class PikaSessionInterceptor implements HttpInterceptor {

  constructor(private sesionQuery: SesionQuery) {

  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {

    const authReq = req.clone({
      headers: this._getPiKaHeaders(req),
    });

    return next.handle(authReq);
  }

  /** Devuelve los encabezados necesarios para la API */
  private _getPiKaHeaders(req: HttpRequest<any>): HttpHeaders {
    const headerSettings: {[name: string]: string | string[]; } = {};
    for (const key of req.headers.keys()) {
      headerSettings[key] = req.headers.getAll(key);
    }
    const s = this.sesionQuery.sesion();
    headerSettings['Authorization'] = 'Bearer ' + s.token;
    headerSettings[HDOMINIOID] = s.IdDominio;
    headerSettings[HUSUARIOID] = s.IdUsuario;
    headerSettings[HUNIDADORGID] = s.IdUnidadOrganizacional;
    headerSettings[HCULTURE] = s.uilocale;
    const newHeader = new HttpHeaders(headerSettings);
    return newHeader;
  }

}
