import { AppConfig } from './../../app-config';
import { first } from 'rxjs/operators';
import { AsyncSubject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MetadataInfo } from '../../@pika/pika-module';
import { Plantilla } from '../model/plantilla';

@Injectable()
export class ServicioBusquedaAPI  {
  
  private endpointPlantilla: string;
  private endpointContenido: string;

  private DepuraUrl(url: string): string {
    return url.replace(/\/$/, '') + '/';
  }

  
  constructor(private http: HttpClient, private config: AppConfig) {
    this.endpointPlantilla = this.DepuraUrl(config.config.apiUrl) + `metadatos/`;
    this.endpointContenido = this.DepuraUrl(config.config.apiUrl) + `contenido/`;
  }


  public ObtienePlantillas(): Observable<Plantilla[]> {
    const url = this.DepuraUrl(this.endpointPlantilla ) + 'plantillas/' ;
    return this.http.get<Plantilla[]>(url);
  }

  
  public ObtieneDatosRepositorio(id: string): Observable<unknown> {
    const url = this.DepuraUrl(this.endpointContenido ) + 'PuntoMontaje/' + id;
    return this.http.get<unknown>(url);
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
