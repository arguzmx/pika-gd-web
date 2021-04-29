import { AppConfig } from './../../app-config';
import { first } from 'rxjs/operators';
import { AsyncSubject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MetadataInfo } from '../../@pika/pika-module';
import { Plantilla } from '../model/plantilla';
import { BusquedaContenido } from '../model/busqueda-contenido';

@Injectable()
export class ServicioBusquedaAPI  {

  
  private endpointPlantilla: string;
  private endpointMetadatos: string;
  private endpointBusqueda: string;

  private DepuraUrl(url: string): string {
    return url.replace(/\/$/, '') + '/';
  }

  
  constructor(private http: HttpClient, private config: AppConfig) {
    this.endpointPlantilla = this.DepuraUrl(config.config.apiUrl) + `metadatos/`;
    this.endpointMetadatos = this.DepuraUrl(config.config.apiUrl) + `metadatos/`;
    this.endpointBusqueda = this.DepuraUrl(config.config.apiUrl) + `contenido/Busqueda`;
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

  public Buscar(busqueda: BusquedaContenido): Observable<any> {
    const subject = new AsyncSubject<any>();
      const url = this.DepuraUrl(this.endpointBusqueda );
      
      this.http.post<any>(url, busqueda).pipe(first())
      .subscribe(m=> {
        subject.next(m);
      }, (e)=>{}, ()=>{subject.complete()})
    return subject;
  }

}
