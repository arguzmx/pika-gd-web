import { SesionQuery } from './../state/sesion.query';
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest,
    HttpHandler, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

    const HCULTURE: string = 'culture';
    const HDOMINIOID: string = 'did';
    const HUNIDADORGID: string = 'tid';

@Injectable()
export class PikaSessionInterceptor implements HttpInterceptor {

  private IdDominio: string = '';
  private IdUnidadOrg: string = '';
  private Token: string = '';
  private UILocale: string = '';
  constructor(private sesionQuery: SesionQuery) {
      this.SessionChanges();
  }

  private SessionChanges() {
    this.sesionQuery.sesion$.subscribe(x => {
      this.IdDominio = x.IdDominio;
      this.IdUnidadOrg = x.IdUnidadOrganizacional;
      this.UILocale = x.uilocale;
      this.Token = x.token;
    });
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

    headerSettings['Authorization'] = 'Bearer ' + this.Token;
    headerSettings[HDOMINIOID] = this.IdDominio;
    headerSettings[HUNIDADORGID] = this.IdUnidadOrg;
    headerSettings[HCULTURE] = this.UILocale;
    const newHeader = new HttpHeaders(headerSettings);
    return newHeader;
  }

}
