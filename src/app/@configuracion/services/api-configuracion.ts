import { PropiedadesUsuario } from './../model/propiedades-usuario';
import { AppConfig } from './../../app-config';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppLogService, ValorListaOrdenada } from '../../@pika/pika-module';
import { TranslateService } from '@ngx-translate/core';
import { ActDominioOU } from '../model/act-dominio-ou';

@Injectable()
export class ApiConfiguracion {

  constructor(
    private app: AppConfig,
    private http: HttpClient,
    private applog: AppLogService,
    private ts: TranslateService,
  ) { }

  private CrearEndpoint(sufijo: string): string {
    return this.app.config.apiUrl.replace(/\/$/, '') + '/' + sufijo;
  }

  public ActualizaDominioOU(dominio: string, ou: string) {
    const url = this.CrearEndpoint('sistema/appconfig/dominiouo');
    return this.http
      .post(url, { Dominio: dominio, OU: ou });
  }

  public ObtieneDominioOU(): Observable<ActDominioOU> {
    const url = this.CrearEndpoint('sistema/appconfig/dominiouo');
    return this.http
      .get<ActDominioOU>(url);
  }



  public ActualizaContrasena(actual: string, nueva: string) {
    const url = this.CrearEndpoint('usuario/perfil/contrasena/actualizar');
    return this.http
      .post(url, { Actual: actual, Nueva: nueva });
  }


  public ActualizaUsuario(propiedades: PropiedadesUsuario) {
    const url = this.CrearEndpoint('usuario/perfil');
    return this.http
      .put(url, propiedades);
  }

  public ObtieneUsuario(): Observable<PropiedadesUsuario> {
    const url = this.CrearEndpoint('usuario/perfil');
    return this.http
      .get<PropiedadesUsuario>(url);
  }

  public ObtienePaises(): Observable<ValorListaOrdenada[]> {
    const url = this.CrearEndpoint('contacto/pais/pares');
    return this.http
      .get<ValorListaOrdenada[]>(url);
  }

  public ObtieneZonasHorarias(): Observable<ValorListaOrdenada[]> {
    const url = this.CrearEndpoint('contacto/pais/zonashorarias');
    return this.http
      .get<ValorListaOrdenada[]>(url);
  }

  public ObtieneGeneros(): Observable<ValorListaOrdenada[]> {
    const url = this.CrearEndpoint('seguridad/genero/pares');
    return this.http
      .get<ValorListaOrdenada[]>(url);
  }

  public ObtieneEstados(paisid: string): Observable<ValorListaOrdenada[]> {
    const url = this.CrearEndpoint('contacto/estado/pares');
    let qs: string = `?i=${0}&t=${10000}`;
    qs = qs + `&ordc=&ordd=&idcache=&f[0][p]=PaisId&f[0][o]=eq&f[0][v]=${paisid}&f[0][n]=0`;
    return this.http
      .get<ValorListaOrdenada[]>(`${url}${qs}`);
  }

}

