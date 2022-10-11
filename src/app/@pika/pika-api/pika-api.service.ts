import { ConsultaBackend } from './../consulta/consulta';
import { AppConfig } from './../../app-config';
import { RutaTipo } from '../state/configuracion/ruta-tipo';
import { IProveedorReporte } from './../metadata/iproveedor-reporte';
import { FiltroConsulta, FiltroConsultaBackend } from './../consulta/filtro-consulta';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Consulta, Paginado, Operacion } from '../consulta';
import { MetadataInfo } from '../metadata';
import {  retry } from 'rxjs/operators';
import { ValorListaOrdenada } from '../metadata/valor-lista';
import { AtributoLista } from '../metadata/atributo-valorlista';
import { SesionQuery } from '../state';
import { ContenidoVinculado } from '../conteido/contenido-vinculado';
import { RequestListaIds } from '../consulta/request-paginado-ids';
import { FiltroConsultaPropiedad } from '../consulta/filtro.-consulta-propiedad';
import { PermisoACL, PostTareaEnDemanda, RespuestaComandoWeb } from '../pika-module';
import { HighlightHit } from '../../@busqueda-contenido/busqueda-contenido.module';
import { PermisoPuntoMontaje } from '../conteido/permiso-punto-montaje';

const retryCount: number = 0;

@Injectable({
  providedIn: 'root',
})

export class PikaApiService<T, U> {

  constructor(
    private app: AppConfig,
    private sessionQ: SesionQuery,
    private http: HttpClient,
  ) {

  }

  public ObtieneRutas(): Observable<RutaTipo[]> {

    let url = this.app.config.pikaApiUrl.replace(/\/$/, '') + '/';
    url = url + 'api/v{version:apiversion}/sistema/appconfig/ruteotipos';
    url = url.replace('{version:apiversion}', this.app.config.apiVersion);
    return this.http.get<RutaTipo[]>(url);
  }


  private CrearEndpoint(TipoEntidad: string): string {
    let url = '';

    // Las rutas de las entidades se obtienen desde el servidor
    if (this.sessionQ.RutasEntidades.length === 0) return url;

   
    const r = this.sessionQ.RutasEntidades.find(x => x.Tipo.toLocaleLowerCase() === TipoEntidad.toLowerCase());
    if (r) {
      url = this.app.config.pikaApiUrl.replace(/\/$/, '') + '/';
      url = url + r.Ruta.replace('{version:apiVersion}', this.app.config.apiVersion).toLocaleLowerCase() + '/';
    }
    return url;
  }


  private RutaBase() : string {
    return this.app.config.pikaApiUrl.replace(/\/$/, '') + '/api/v' + this.app.config.apiVersion;
  }

  private CrearEndpointPersonalizado(path: string): string {
    return this.app.config.pikaApiUrl.replace(/\/$/, '') + '/' + path;
  }

  public SinopisPorIds(consultaId: string, Ids: string[]) {
    const endpoint = this.RutaBase() + "/contenido/busqueda/sinopsis/" + consultaId;
    return this.http.post<HighlightHit[]>(endpoint, Ids);
  }

  public ObtenerPaginaPorIds(entidad: string, q: ConsultaBackend): Observable<unknown[]> {
    const endpoint = this.CrearEndpoint(entidad) + "page/ids";
    if(!q.IdCache) {
      q.ord_columna = '';
      q.ord_direccion = '';
    }
    return this.http.post<unknown[]>(endpoint, q);
  }

  ObtienePermisoPuntoMontaje(id: string): Observable<PermisoPuntoMontaje> {
    const endpoint = this.RutaBase() + `/contenido/puntomontaje/permisos/${id}`;
    return this.http.get<PermisoPuntoMontaje>(endpoint);
  }

  GetContenidoVinculado(entidad: string, id: string): Observable<ContenidoVinculado> {
    const endpoint = this.CrearEndpoint(entidad);
    return this.http.get<any>(endpoint + id + '/contenido');
  }

  VinculaElmentoContenido(entidad: string, id: string, contenidoId: string): Observable<any> {
    const endpoint = this.CrearEndpoint(entidad);
    return this.http.post<any>(endpoint + id + '/contenido/' + contenidoId, null);
  }
  public CreaCarpeta(entidad: string, PuntoMontajeId: string, ruta ): Observable<any> {
    const endpoint = this.CrearEndpoint(entidad) + "ruta";
    return this.http.post<MetadataInfo>(endpoint, { UsuarioId: '', Ruta: ruta, PuntoMontajeId: PuntoMontajeId });
 }


  GetMetadata(entidad: string): Observable<MetadataInfo> {
    const endpoint = this.CrearEndpoint(entidad);
    return this.http.get<MetadataInfo>(endpoint + 'metadata')
      .pipe(
        retry(retryCount),
      );
  }

  
  GetACL(entidad: string, id: string ): Observable<number> {
    const endpoint = this.CrearEndpoint(entidad);
    return this.http.get<number>(endpoint + `acl/${id}`);
  }

  GetFiltroBusqueda(entidad: string, id: string): Observable<FiltroConsultaPropiedad[]> {
    const endpoint = this.CrearEndpoint(entidad);
    return this.http.get<FiltroConsultaPropiedad[]>(endpoint + `filtrobusqueda/${id}`)
      .pipe(
        retry(retryCount),
      );
  }

  Post(entity: T, entidad: string) {
    const endpoint = this.CrearEndpoint(entidad);
    const headers = new HttpHeaders()
      .set('content-type', 'application/json');
    return this.http.post(endpoint, entity, { 'headers': headers })
      .pipe(
        retry(retryCount),
      );
  }

  PostCommand(entidad: string, command: string, body: unknown): Observable<RespuestaComandoWeb> {
    const endpoint = this.CrearEndpoint(entidad) + `webcommand/${command}`;
    const headers = new HttpHeaders()
      .set('content-type', 'application/json');
    return this.http.post<RespuestaComandoWeb>(endpoint, body, { 'headers': headers })
      .pipe(
        retry(retryCount),
      );
  }

  PostMiembros(idPadre: string, idMiembros: string[], entidad: string) {
    const endpoint = this.CrearEndpoint(entidad) + idPadre;
    const headers = new HttpHeaders()
      .set('content-type', 'application/json');
    return this.http.post(endpoint, idMiembros, { 'headers': headers })
      .pipe(
        retry(retryCount),
      );
  }

  DeleteMiembros(idPadre: string, idMiembros: string[], entidad: string): Observable<any> {
    const endpoint = this.CrearEndpoint(entidad) + idPadre + '/';
    let ids: string = '';
    idMiembros.forEach(x => {
      ids = ids + x + ',';
    });

    const headers = new HttpHeaders()
      .set('content-type', 'application/json');
    return this.http.delete(endpoint + ids, { 'headers': headers })
      .pipe(
        retry(retryCount),
      );
  }

  Put(Id: string, entity: T, entidad: string) {
    const endpoint = this.CrearEndpoint(entidad);
    const headers = new HttpHeaders()
      .set('content-type', 'application/json');
    return this.http.put(endpoint + Id, entity, { 'headers': headers })
      .pipe(
        retry(retryCount),
      );
  }

  Page(consulta: Consulta, entidad: string): Observable<Paginado<T>> {
    const endpoint = this.CrearEndpoint(entidad);
    const qs = this.getQueryStringConsulta(consulta);

    return this.http.get<Paginado<T>>(endpoint + 'page' + qs)
      .pipe(
        retry(retryCount),
      );
  }

  PostPersonalizada(consulta: unknown, path: string): Observable<unknown> {
    const endpoint = this.CrearEndpointPersonalizado(path);
    return this.http.post<unknown>(endpoint, consulta)
      .pipe(
        retry(retryCount),
      );
  }

  PostPagePersonalizada(consulta: unknown, path: string): Observable<Paginado<T>> {
    const endpoint = this.CrearEndpointPersonalizado(path);
    return this.http.post<Paginado<T>>(endpoint, consulta)
      .pipe(
        retry(retryCount),
      );
  }

  PairList(lista: AtributoLista, consulta: Consulta): Observable<ValorListaOrdenada[]> {
    consulta.indice = 0;
    if (lista.TypeAhead === false) {
      consulta.tamano = 1000;
    } else {
      consulta.tamano = 50;
    }
    const endpoint = this.CrearEndpoint(lista.Entidad);
    
    if (lista.EsListaTemas) {
      const qs = this.getQueryStringConsulta(consulta);
      return this.http.get<ValorListaOrdenada[]>(endpoint + 'tema' + qs)
        .pipe(
          retry(retryCount),
        );
    } else {
      const qs = this.getQueryStringConsulta(consulta);
      return this.http.get<ValorListaOrdenada[]>(endpoint + 'pares' + qs)
        .pipe(
          retry(retryCount),
        );
    }
  }

  PairListTypeAhead(lista: AtributoLista, texto: string, filtros: FiltroConsulta[] =[]): Observable<ValorListaOrdenada[]> {
    const consulta: Consulta = new Consulta();
    const filtro: FiltroConsulta = new FiltroConsulta();
    consulta.indice = 0;
    consulta.tamano = 50;
    filtro.Negacion = false;
    filtro.Operador = Operacion.OP_STARTS;
    filtro.Propiedad = 'Texto',
      filtro.Valor = [texto];
    filtro.ValorString = texto;
    consulta.FiltroConsulta.push(filtro);
    
    if (filtros.length>0) {
      filtros.forEach(f=> {
        consulta.FiltroConsulta.push(f);
      });
    }
    

    const endpoint = this.CrearEndpoint(lista.Entidad);
    const qs = this.getQueryStringConsulta(consulta);

    return this.http.get<ValorListaOrdenada[]>(endpoint + 'pares' + qs)
      .pipe(
        retry(retryCount),
      );
  }

  PairListbyId(ids: string[], entidad: string): Observable<ValorListaOrdenada[]> {
    const consulta: Consulta = new Consulta();
    consulta.indice = 0;
    consulta.tamano = 1000;

    let qids = '';
    ids.forEach(s => { qids = qids + s + ','; });

    const endpoint = this.CrearEndpoint(entidad);
    const qs = this.getQueryStringConsulta(consulta);
    return this.http.get<ValorListaOrdenada[]>(endpoint + `pares/${qids}` + qs)
      .pipe(
        retry(retryCount),
      );
  }


  PageRelated(Type: string, Id: string, consulta: Consulta, entidad: string): Observable<Paginado<T>> {
    const endpoint = this.CrearEndpoint(entidad);
    const qs = this.getQueryStringConsulta(consulta);

    return this.http.get<Paginado<T>>(endpoint + `page/${Type.toLowerCase()}/${Id}` + qs)
      .pipe(
        retry(retryCount),
      );
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

  Get(Id: U, entidad: string): Observable<any> {
    const endpoint = this.CrearEndpoint(entidad);
    const headers = new HttpHeaders()
      .set('content-type', 'application/json');
    return this.http.get(endpoint + Id, { 'headers': headers })
      .pipe(
        retry(retryCount),
      );
  }

  GetHieRaices(IdHie: U, entidad: string): Observable<any> {
    const endpoint = this.CrearEndpoint(entidad) + 'jerarquia/' + IdHie;
    const headers = new HttpHeaders()
      .set('content-type', 'application/json');
    return this.http.get(endpoint, { 'headers': headers })
      .pipe(
        retry(retryCount),
      );
  }

  GetHieHijos(IdHie: U, Id: U, entidad: string): Observable<any> {
    const endpoint = this.CrearEndpoint(entidad) + 'jerarquia/' + IdHie + '/' + Id;
    const headers = new HttpHeaders()
      .set('content-type', 'application/json');
    return this.http.get(endpoint, { 'headers': headers })
      .pipe(
        retry(retryCount),
      );
  }
  
  private getFileNameFromHttpResponse(httpResponse: HttpResponse<Blob>): string {
    var contentDispositionHeader = httpResponse.headers.get('Content-Disposition');
    var result = contentDispositionHeader.split(';')[1].trim().split('=')[1];
    return result.replace(/"/g, '');
  }

  GetReport(entidad: string, reporte: IProveedorReporte, filename?: string) {
    let url = this.CrearEndpoint(entidad) + reporte.Url;
    const headers = new HttpHeaders();
    reporte.Parametros.forEach(p => {
      url = url.replace(`{${p.Id}}`, p['Valor']);
    });

    this.http.get(url, { observe: 'response', headers, responseType: 'blob' as 'json' }).subscribe(
      (response: HttpResponse<Blob>) => {
        const binaryData = [];
        binaryData.push(response.body);
        const downloadLink = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, { type: response.type.toString() }));
        downloadLink.setAttribute('download', this.getFileNameFromHttpResponse(response));  
        document.body.appendChild(downloadLink);
        downloadLink.click();
      },
      (err) => {
        console.warn(err);
      },
    );
  }

  Delete(Ids: U[], entidad: string): Observable<any> {
    const endpoint = this.CrearEndpoint(entidad);
    let ids: string = '';
    Ids.forEach(x => {
      ids = ids + x + ',';
    });

    const headers = new HttpHeaders()
      .set('content-type', 'application/json');
    return this.http.delete(endpoint + ids, { 'headers': headers })
      .pipe(
        retry(retryCount),
      );
  }


  //Obtiene los temas de selección para la entidad y usuario actual
  TemaSeleccionObtener(entidad: string): Observable<ValorListaOrdenada[]> {
    const endpoint = this.CrearEndpoint(entidad) + 'tema';
    
    return this.http.get<ValorListaOrdenada[]>(endpoint)
      .pipe(
        retry(retryCount),
      );
  }

  // Crea un tema de seleccion para el tipo de entidad
  TemaSeleccionAdicionar(nombre: string, entidad: string): Observable<ValorListaOrdenada> {
    const endpoint = this.CrearEndpoint(entidad) + 'tema/' + nombre;
    const headers = new HttpHeaders()
      .set('content-type', 'application/json');
    return this.http.post<ValorListaOrdenada>(endpoint, null, { 'headers': headers })
      .pipe(
        retry(retryCount),
      );
  }

  // Elimina un tema de seleccion para la entidad y usuario
  TemaSeleccionEliminar(id: string, entidad: string): Observable<any> {
    const endpoint = this.CrearEndpoint(entidad) + 'tema/' + id; 
    const headers = new HttpHeaders()
      .set('content-type', 'application/json');
    return this.http.delete<any>(endpoint, { 'headers': headers })
      .pipe(
        retry(retryCount),
      );
  }

  SeleccionAdicionar(temaid: string,  Ids: string[], entidad: string): Observable<any> {
    const endpoint = this.CrearEndpoint(entidad) + `tema/${temaid}/seleccion`;
    const headers = new HttpHeaders()
      .set('content-type', 'application/json');
    const lista = {
      Ids: Ids
    }
    return this.http.post(endpoint, lista, { 'headers': headers })
      .pipe(
        retry(retryCount),
      );
  }

  SeleccionEliminar(temaid: string, Ids: string[], entidad: string): Observable<any>  {
    const endpoint = this.CrearEndpoint(entidad) + `tema/${temaid}seleccion/eliminar`;
    const headers = new HttpHeaders()
      .set('content-type', 'application/json');
    const lista = {
      Ids: Ids
    }
    return this.http.post(endpoint, lista, { 'headers': headers })
      .pipe(
        retry(retryCount),
      );
  }

  SeleccionVaciar(temaid: string, entidad: string): Observable<any> {
    const endpoint = this.CrearEndpoint(entidad) + `tema/${temaid}/seleccion/vaciar`;
    const headers = new HttpHeaders()
      .set('content-type', 'application/json');
    return this.http.delete(endpoint, { 'headers': headers })
      .pipe(
        retry(retryCount),
      );
  }


  ObtenerTareasEnDemanda() :  Observable<PostTareaEnDemanda[]> {
    const endpoint = this.CrearEndpoint('TareaEnDemanda'); // Mantener las mayúsculas
    const headers = new HttpHeaders()
      .set('content-type', 'application/json');
    return this.http.get<PostTareaEnDemanda[]>(endpoint, { 'headers': headers })
      .pipe(
        retry(retryCount),
      );
  }

  EliminarTareaEnDemanda(id: string) :  Observable<PostTareaEnDemanda[]> {
    const endpoint = `${this.CrearEndpoint('TareaEnDemanda')}${id}`; // Mantener las mayúsculas
    const headers = new HttpHeaders()
      .set('content-type', 'application/json');
    return this.http.delete<PostTareaEnDemanda[]>(endpoint, { 'headers': headers })
      .pipe(
        retry(retryCount),
      );
  }

}
