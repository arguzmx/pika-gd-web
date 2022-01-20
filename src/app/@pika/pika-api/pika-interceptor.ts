import { SesionQuery } from './../state/sesion.query';
import { Injectable, Optional } from '@angular/core';
import {
  HttpInterceptor, HttpRequest,
  HttpHandler, HttpEvent, HttpHeaders
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { OAuthModuleConfig, OAuthResourceServerErrorHandler, OAuthStorage } from 'angular-oauth2-oidc';

const HCULTURE: string = 'culture';
const HDOMINIOID: string = 'did';
const HUNIDADORGID: string = 'tid';
const TIMEOFFSET: string = 'gmtoffset';

@Injectable()
export class PikaSessionInterceptor implements HttpInterceptor {

  private IdDominio: string = '';
  private IdUnidadOrg: string = '';
  private Token: string = '';
  private UILocale: string = '';
  private timeZoneOffset = new Date().getTimezoneOffset();

  constructor(
    private sesionQuery: SesionQuery,
    private authStorage: OAuthStorage,
    private errorHandler: OAuthResourceServerErrorHandler,
    @Optional() private moduleConfig: OAuthModuleConfig
  ) {
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

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const authReq = req.clone({
      headers: this._getPiKaHeaders(req),
    });

    
    return next.handle(authReq);
  }

  /** Devuelve los encabezados necesarios para la API */
  private _getPiKaHeaders(req: HttpRequest<any>): HttpHeaders {

    const headerSettings: { [name: string]: string | string[]; } = {};
    for (const key of req.headers.keys()) {
      headerSettings[key] = req.headers.getAll(key);
    }

    let token = this.authStorage.getItem('access_token');
    let header = 'Bearer ' + token;

    headerSettings['Authorization'] = header;
    headerSettings[HDOMINIOID] = this.IdDominio;
    headerSettings[HUNIDADORGID] = this.IdUnidadOrg;
    headerSettings[HCULTURE] = this.UILocale;
    headerSettings[TIMEOFFSET] = this.timeZoneOffset.toString();
    const newHeader = new HttpHeaders(headerSettings);
    return newHeader;
  }

}
