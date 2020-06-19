import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EndpointDictionary } from './endpoint-dictionary';
import { Observable } from 'rxjs';
import { Consulta, Paginado } from '../consulta';
import { MetadataInfo } from '../metadata';


@Injectable({
  providedIn: 'root',
})
export class PikaApiService <T, U> {

  private Endpoint: string;

  constructor(
    baseUrl: string,
    TipoEntidad: string,
    private http: HttpClient,
  ) {
    this.Endpoint = '';
    if (EndpointDictionary[TipoEntidad]) {
      this.Endpoint = baseUrl + EndpointDictionary[TipoEntidad] + '/';
    }
  }



  GetMetadata(): Observable<MetadataInfo> {
    return this.http.get<MetadataInfo>(this.Endpoint + 'metadata');
  }

  Post(entitty: T) {
    return null;
  }

  Put(Id: any, entitty: T) {
    return null;
  }

  Page(consulta: Consulta): Observable<Paginado<T>> {

    let qs: string = `?i=${consulta.indice}&t=${consulta.tamano}`;
    qs = qs + `&ordc=${consulta.ord_columna}&ordd=${consulta.ord_direccion}`;

    let index: number = 0;
    consulta.FiltroConsulta.forEach((f) => {
      qs =
        qs +
        `&f[${index}][p]=${f.Propiedad}&f[${index}][o]=${f.Operador}}&f[${index}][v]=${f.ValorString}}`;
      index++;
    });

    return this.http.get<Paginado<T>>(this.Endpoint + 'page' + qs);
  }

  Get(Id: U): T {
    return null;
  }

  Delete(Ids: U[]): any {
    return null;
  }


}
