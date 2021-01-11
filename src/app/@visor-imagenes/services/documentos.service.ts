import { first } from 'rxjs/operators';
import { CacheEntidadesService } from './../../@editor-entidades/services/cache-entidades.service';
import { MetadataInfo } from './../../@pika/metadata/metadata-info';
import { Plantilla } from './../model/plantilla';
import { environment } from './../../../environments/environment';
import { AsyncSubject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Documento } from '../model/documento';
import { IDocumentoService } from '../model/i-documento-service';
import { DocumentoPlantilla, RequestValoresPlantilla, VinculosObjetoPlantilla } from '../../@pika/pika-module';

@Injectable()
export class DocumentosService implements IDocumentoService {

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

  public ObtieneDocumento(documentoId: string ): Observable<Documento> {
    const url = this.DepuraUrl(environment.visordUrl) + `documento/${documentoId}`;
    return this.http.get<Documento>(url);
  }

  public ObtienePlantillas(): Observable<Plantilla[]> {
    const url = this.DepuraUrl(this.endpointPlantilla ) + 'plantillas/' ;
    return this.http.get<Plantilla[]>(url);
  }


  // REGION DE LLAMADAS A METADATOS
  
  public ObtieneMetadataInfo(id: string): Observable<MetadataInfo> {

    const subject = new AsyncSubject<MetadataInfo>();
    // const clave = this.cache.ClaveMetadatos(id);
    // if(this.cache.has(clave)) {
    //   subject.next(this.cache.get(clave));
    //   subject.complete();
    // } else {
      const url = this.DepuraUrl(this.endpointPlantilla ) + id;
      this.http.get<MetadataInfo>(url).pipe(first())
      .subscribe(m=> {
        // this.cache.set(clave, m);
        subject.next(m);
      }, (e)=>{}, ()=>{subject.complete()})
    // }
    return subject;

  }

  public CreaMetadatosPlantilla(plantillaId: string, valores: RequestValoresPlantilla): Observable<DocumentoPlantilla> {
    const url = this.DepuraUrl(this.endpointMetadatos ) + plantillaId ;
    return this.http.post<DocumentoPlantilla>(url, valores);
  }

  public ActualizaMetadatosPlantilla(plantillaId: string, id: string, valores: RequestValoresPlantilla): Observable<unknown> {
    const url = this.DepuraUrl(this.endpointMetadatos ) + `${plantillaId}/${id}`;
    return this.http.put<unknown>(url, valores);
  }

  public ObtieneVinculosMetadatos(tipo: string, id: string): Observable<VinculosObjetoPlantilla> {
    const url = this.DepuraUrl(this.endpointMetadatos ) + `vinculos/${tipo}/${id}`;
    return this.http.get<VinculosObjetoPlantilla>(url);
  }

  public ObtieneDocumentoUnicoMetadatos(plantillaid: string, id: string): Observable<DocumentoPlantilla> {
    const url = this.DepuraUrl(this.endpointMetadatos ) + `${plantillaid}/${id}`;
    return this.http.get<DocumentoPlantilla>(url);
  }

  public EliminaDocumentoUnicoMetadatos(plantillaid: string, id: string): Observable<string> {
    const url = this.DepuraUrl(this.endpointMetadatos ) + `${plantillaid}/${id}`;
    return this.http.delete<string>(url);
  }
  
  // =====================================
  

}
