import { first } from 'rxjs/operators';
import { environment } from './../../../environments/environment';
import { AsyncSubject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MetadataInfo } from '../../@pika/pika-module';
import { Plantilla } from '../model/plantilla';

@Injectable()
export class ServicioBusquedaAPI  {

  private endpointPlantilla: string;
  private endpointMetadatos: string;

  private DepuraUrl(url: string): string {
    return url.replace(/\/$/, '') + '/';
  }

  //constructor(private http: HttpClient, private cache: CacheEntidadesService) {
  constructor(private http: HttpClient) {
    this.endpointPlantilla = this.DepuraUrl(environment.apiUrl) + `metadatos/`;
    this.endpointMetadatos = this.DepuraUrl(environment.apiUrl) + `metadatos/`;

  }


  public ObtienePlantillas(): Observable<Plantilla[]> {
    const url = this.DepuraUrl(this.endpointPlantilla ) + 'plantillas/' ;
    return this.http.get<Plantilla[]>(url);
  }


  public ObtieneMetadataPlantilla(id: string): Observable<MetadataInfo> {

    const subject = new AsyncSubject<MetadataInfo>();
      const url = this.DepuraUrl(this.endpointPlantilla ) + id;
      this.http.get<MetadataInfo>(url).pipe(first())
      .subscribe(m=> {
        subject.next(m);
      }, (e)=>{}, ()=>{subject.complete()})
    return subject;
  }

}
