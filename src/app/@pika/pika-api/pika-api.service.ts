import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EndpointDictionary } from './endpoint-dictionary';
import { Observable } from 'rxjs';
import { Consulta, Paginado } from '../consulta';
import { MetadataInfo } from '../metadata';
import { retry } from 'rxjs/operators';

const retryCount: number = 1;

@Injectable({
  providedIn: 'root',
})
export class PikaApiService <T, U> {

  private Endpoint: string;

  constructor(
    private baseUrl: string,
    private TipoEntidad: string,
    private router: Router,
    private http: HttpClient,
  ) {
    this.Endpoint = '';
    if (EndpointDictionary[TipoEntidad]) {
      this.Endpoint = baseUrl.replace(/\/$/, '') + '/' + EndpointDictionary[TipoEntidad] + '/';
    }
  }



  GetMetadata(): Observable<MetadataInfo> {
    return this.http.get<MetadataInfo>(this.Endpoint + 'metadata')
    .pipe(
      retry(retryCount),
    );
  }

  Post(entity: T) {
    const headers= new HttpHeaders()
    .set('content-type', 'application/json');
    return this.http.post(this.Endpoint, entity, { 'headers': headers })
    .pipe(
      retry(retryCount),
    );
  }

  Put(Id: string, entity: T) {
    const headers = new HttpHeaders()
    .set('content-type', 'application/json');
    return this.http.put(this.Endpoint + Id, entity, { 'headers': headers })
    .pipe(
      retry(retryCount),
    );
  }

  Page(consulta: Consulta): Observable<Paginado<T>> {

    let qs: string = `?i=${consulta.indice}&t=${consulta.tamano}`;
    qs = qs + `&ordc=${consulta.ord_columna}&ordd=${consulta.ord_direccion}`;

    let index: number = 0;
    consulta.FiltroConsulta.forEach((f) => {
      qs =
        qs +
        `&f[${index}][p]=${f.Propiedad}&f[${index}][o]=${f.Operador}}&f[${index}][v]=${f.ValorString}`;
      index++;
    });

    return this.http.get<Paginado<T>>(this.Endpoint + 'page' + qs)
    .pipe(
      retry(retryCount),
    );
  }

  Get(Id: U): Observable<any> {
    const headers = new HttpHeaders()
    .set('content-type', 'application/json');
    return this.http.get(this.Endpoint + Id, { 'headers': headers })
    .pipe(
      retry(retryCount),
    );
  }

  Delete(Ids: U[]): any {

    let ids: string = '';
    Ids.forEach( x => {
      ids = ids + x + ',';
    });

    const headers = new HttpHeaders()
    .set('content-type', 'application/json');
    return this.http.delete(this.Endpoint + ids, { 'headers': headers })
    .pipe(
      retry(retryCount),
    );
  }

}
