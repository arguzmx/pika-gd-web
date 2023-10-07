import { PropiedadesUsuario } from './../model/propiedades-usuario';
import { AppConfig } from './../../app-config';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Consulta, ValorListaOrdenada } from '../../@pika/pika-module';
import { TranslateService } from '@ngx-translate/core';
import { ActDominioOU } from '../model/act-dominio-ou';
import { ReporteSalud } from '../model/reporte-salud';
import { AppLogService } from '../../services/app-log/app-log.service';
import { EstadoOCR } from '../model/estado-ocr';
import { RespuestaImportacion } from '../model/respuesta-importar';
@Injectable()
export class ApiConfiguracion {
  private endpointSalud: string;
  private endpointActivacion: string;
  private endpointRegistro: string;
  private endpointActivo: string;
  private endpointUA: string;
  
  private DepuraUrl(url: string): string {
    return url.replace(/\/$/, '') + '/';
  }
  constructor(
    private app: AppConfig,
    private http: HttpClient,
    private applog: AppLogService,
    private ts: TranslateService,
  ) { 
    this.endpointSalud = this.DepuraUrl(this.app.config.pikaApiUrl) + this.app.config.healthendpoint;
    this.endpointActivacion = this.DepuraUrl(this.app.config.apiUrl) + 'Sistema/AppConfig';
    this.endpointActivo = this.DepuraUrl(this.app.config.pikaApiUrl) + 'api/v1.0/gd/Activo';
    this.endpointUA = this.DepuraUrl(this.app.config.pikaApiUrl) + 'api/v1.0/gd/UnidadAdministrativaArchivo';
    
  }

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

  public ObtieneEstadoOCR(): Observable<EstadoOCR> {
    const url = this.CrearEndpoint('sistema/appconfig/estadoocr');
    return this.http
      .get<EstadoOCR>(url);
  }


  public ReiniciaOCRErrores(): Observable<any> {
    const url = this.CrearEndpoint('sistema/appconfig/ocrerroneos');
    return this.http.post(url, null);
  }


  public ActualizaContrasenaUsuario(id: string, nueva: string) {
    const url = this.CrearEndpoint('seguridad/usuarios/contrasena');
    return this.http
      .post(url, { Id: id, Nueva: nueva });
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
    const url = this.CrearEndpoint('contacto/pais/pares?i=0&t=10000');
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
  
  ObtieneEstadoServidor(): Observable<ReporteSalud> {
    return this.http.get<ReporteSalud>(this.endpointSalud);
  }

  ObtieneServidorActivado(): Observable<any> {
    return this.http.get(`${this.endpointActivacion}/activado`);
  }

  ObtieneServidorFingerprint(): Observable<string> {
    return this.http.get(`${this.endpointActivacion}/fingerprint`, { responseType: 'text' });
  }

  ObtieneAccessoServidorRegistro(): Observable<any> {
    return this.http.get(`${this.endpointRegistro}/ping`);
  }

  GenerarRegistro(registro: any): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'application/json');
    return this.http.post(`${this.endpointRegistro}/activar`, registro, { 'headers': headers } );
  }

  ActivarServidor(activacion: string): Observable<any> {
    const headers = new HttpHeaders().set('content-type', 'text/plain');
    return this.http.post(`${this.endpointActivacion}/activar`, activacion, { 'headers': headers } );
  }

  ObtienePlantillaInventario(): Observable<Blob> {
    const httpOptions = {
      responseType: 'blob' as 'json'
    };
    return this.http.get<Blob>(`${this.endpointActivo}/importar`, httpOptions);
  }

  CargaInventario(data: FormData): Observable<RespuestaImportacion> {
    return this.http.post<RespuestaImportacion>(`${this.endpointActivo}/importar`, data);
  }

  DescargaInventario(id: string): Observable<Blob> {
    const httpOptions = {
      responseType: 'blob' as 'json'
    };
    return this.http.get<Blob>(`${this.endpointActivo}/importar/${id}`,  httpOptions);
  }

  ObtieneUAs(): Observable<ValorListaOrdenada[]> {
    const consulta: Consulta = new Consulta();
    consulta.tamano = 1000;
    const qs = this.getQueryStringConsulta(consulta);
    return this.http.get<ValorListaOrdenada[]>(`${this.endpointUA}/pares${qs}`);
  }

  ObtieneArchivos(id: string): Observable<ValorListaOrdenada[]> {
    const consulta: Consulta = new Consulta();
    return this.http.get<ValorListaOrdenada[]>(`${this.endpointUA}/${id}/archivo/pares`);
  }


  private getQueryStringConsulta(consulta: Consulta): string {
    let qs: string = `?i=${consulta.indice}&t=${consulta.tamano}`;
    qs = qs + `&ordc=${consulta.ord_columna}&ordd=${consulta.ord_direccion}&idcache=${consulta.IdCache ?? ''}`;

    if(consulta.IdSeleccion) {
      qs = qs + `&sel=${consulta.IdSeleccion}`;
    }

    let index: number = 0;
    if (consulta.FiltroConsulta) {
      consulta.FiltroConsulta.forEach((f) => {
        qs =
          qs +
          `&f[${index}][p]=${f.Propiedad}&f[${index}][o]=${f.Operador}&f[${index}][v]=${f.ValorString}`;

        if (f.Negacion) qs =
          qs + `&f[${index}][n]=1`;

        index++;
      });
    }
    return qs;
  }

}
