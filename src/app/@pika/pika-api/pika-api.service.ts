import { FiltroConsulta } from './../consulta/filtro-consulta';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EndpointDictionary } from './endpoint-dictionary';
import { Observable } from 'rxjs';
import { Consulta, Paginado, Operacion } from '../consulta';
import { MetadataInfo } from '../metadata';
import { retry } from 'rxjs/operators';
import { ValorListaOrdenada } from '../metadata/valor-lista';
import { AtributoLista } from '../metadata/atributo-valorlista';

const retryCount: number = 1;

@Injectable({
  providedIn: 'root',
})
export class PikaApiService <T, U> {


  private CrearEndpoint(TipoEntidad: string): string {
    if (EndpointDictionary[TipoEntidad.toLowerCase()]) {
      return this.baseUrl.replace(/\/$/, '') + '/' + EndpointDictionary[TipoEntidad.toLowerCase()] + '/';
    }
    return '';
  }

  constructor(
    private baseUrl: string,
    private http: HttpClient,
  ) {

  }



  GetMetadata(entidad: string): Observable<MetadataInfo> {
    const endpoint = this.CrearEndpoint(entidad);
    return this.http.get<MetadataInfo>(endpoint + 'metadata')
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

  PairList(lista: AtributoLista, consulta: Consulta): Observable<ValorListaOrdenada[]> {
    consulta.indice = 0;
    if (lista.TypeAhead === false) {
      consulta.tamano = 1000;
    } else {
      consulta.tamano = 50;
    }
    const endpoint = this.CrearEndpoint(lista.Entidad);
    const qs = this.getQueryStringConsulta(consulta);
    return this.http.get<ValorListaOrdenada[]>(endpoint + 'pares' + qs)
    .pipe(
      retry(retryCount),
    );
  }

  PairListTypeAhead(lista: AtributoLista, texto: string): Observable<ValorListaOrdenada[]> {
    const consulta: Consulta = new Consulta();
    const filtro: FiltroConsulta = new FiltroConsulta();
    consulta.indice = 0;
    consulta.tamano = 20;
    filtro.Negacion = false;
    filtro.Operador = Operacion.OP_STARTS;
    filtro.Propiedad = 'Texto',
    filtro.Valor = [texto];
    filtro.ValorString = texto;
    consulta.FiltroConsulta.push( filtro );
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
    ids.forEach( s =>   { qids = qids + s + ','; } );

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
    qs = qs + `&ordc=${consulta.ord_columna}&ordd=${consulta.ord_direccion}`;

    let index: number = 0;
    if(consulta.FiltroConsulta) {
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

  Delete(Ids: U[], entidad: string): Observable<any> {
    const endpoint = this.CrearEndpoint(entidad);
    let ids: string = '';
    Ids.forEach( x => {
      ids = ids + x + ',';
    });

    const headers = new HttpHeaders()
    .set('content-type', 'application/json');
    return this.http.delete(endpoint + ids, { 'headers': headers })
    .pipe(
      retry(retryCount),
    );
  }

}
