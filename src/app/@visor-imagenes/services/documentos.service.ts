import { AppConfig } from './../../app-config';
import { first } from 'rxjs/operators';
import { MetadataInfo } from './../../@pika/metadata/metadata-info';
import { Plantilla } from './../model/plantilla';
import { AsyncSubject, Observable, BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Documento } from '../model/documento';
import { IDocumentoService } from '../model/i-documento-service';
import { DocumentoPlantilla, PermisoPuntoMontaje, PostTareaEnDemanda, RequestValoresPlantilla, VinculosObjetoPlantilla } from '../../@pika/pika-module';
import { HighlightHit } from '../../@busqueda-contenido/busqueda-contenido.module';
import { Pagina } from '../model/pagina';
import { AppLogService } from '../../services/app-log/app-log.service';

@Injectable()
export class DocumentosService implements IDocumentoService {

  private endpointPlantilla: string;
  private endpointMetadatos: string;
  private DepuraUrl(url: string): string {
    return url.replace(/\/$/, '') + '/';
  }

  //constructor(private http: HttpClient, private cache: CacheEntidadesService) {
  constructor(
    private applog: AppLogService,
    private app: AppConfig,
    private http: HttpClient) {
    this.endpointPlantilla = this.DepuraUrl(this.app.config.apiUrl) + `metadatos/`;
    this.endpointMetadatos = this.DepuraUrl(this.app.config.apiUrl) + `metadatos/`;
  }
  
  EliminaPaginas(id: string, paginas: Pagina[]): Observable<any> {
    let csvidpaginas = '';
    paginas.forEach(p=> {
      csvidpaginas += `${p.Id},`;
    });
    const endpoint = this.DepuraUrl(this.app.config.apiUrl) +  `contenido/elemento/paginas/${id}/eliminar/${csvidpaginas}`;
    return this.http.delete<any>(endpoint);
  }


  RotarPaginas(documentoId: string, paginas: string[], angulo: number) {
    const endpoint = this.DepuraUrl(this.app.config.apiUrl) +  `contenido/elemento/paginas/${documentoId}/rotar/${angulo}`;
    return this.http.post<any>(endpoint,paginas);
  }


  ReflejarPaginas(documentoId: string, paginas: string[], direccion: string) {
    const endpoint = this.DepuraUrl(this.app.config.apiUrl) +  `contenido/elemento/paginas/${documentoId}/reflejar/${direccion.toUpperCase()}`;
    return this.http.post<any>(endpoint,paginas);
  }

  MoverPaginas(documentoId: string,posicion: number, paginas: number[]) {
    const endpoint = this.DepuraUrl(this.app.config.apiUrl) +  `contenido/elemento/paginas/${documentoId}/mover/${posicion}`;
    return this.http.post<any>(endpoint,paginas);
  }

  ReordenarPorNombre(documentoId: string): Observable<any> {
    const endpoint = this.DepuraUrl(this.app.config.apiUrl) +  `contenido/elemento/paginas/${documentoId}/ordernar/alfabetico`;
    return this.http.post<any>(endpoint,null);
  }


  ObtienePermisoPuntoMontaje(id: string): Observable<PermisoPuntoMontaje> {
    const endpoint = this.DepuraUrl(this.app.config.apiUrl) +  `contenido/puntomontaje/permisos/${id}`;
    return this.http.get<PermisoPuntoMontaje>(endpoint);
  }

  OntieneSinopsis(busqeudaId: string, elementoId: string): Observable<HighlightHit[]> {
    const url = this.DepuraUrl(this.app.config.apiUrl) + `contenido/Busqueda/sinopsis/${busqeudaId}`;
    return this.http.post<HighlightHit[]>(url, [elementoId]);
  }

  DescargaArchivo(url: string, nombre: string ) {
    
    const headers = new HttpHeaders();
    this.http.get(url, { observe: 'response', headers, responseType: 'blob' as 'json' }).subscribe(
      (response: HttpResponse<Blob>) => {
        const binaryData = [];
        binaryData.push(response.body);
        const downloadLink = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, { type: response.type.toString() }));
        if(nombre) {
          downloadLink.setAttribute('download', nombre);
        } else {
          downloadLink.setAttribute('download', this.getFileNameFromHttpResponse(response));  
        }
        document.body.appendChild(downloadLink);
        downloadLink.click();
      },
      (err) => {
        console.warn(err);
      },
    );
  }


  ObtieneZIP(id: string, version: string) {
    const url = this.DepuraUrl(this.app.config.apiUrl) + `contenido/Elemento/zip/${id}/${version}`;
    const headers = new HttpHeaders();
   
    this.http.post<PostTareaEnDemanda>(url, { observe: 'response', headers }).subscribe(
      (r) => {
        this.applog.ExitoT('componentes.visor-documento.crear-zip-ack');
      },
      (err) => {

        if(err.status==400 || err.status==404)
        {
          this.applog.AdvertenciaT(`componentes.visor-documento.${err.error}`);
        } else {
          this.applog.FallaT(`${err.error}`);
        }
      },
    );
  }

  ObtienePDF(id: string, version: string, porcentaje: number) {
    const url = this.DepuraUrl(this.app.config.apiUrl) + `contenido/Elemento/pdf/${id}/${version}/${porcentaje}`;
    const headers = new HttpHeaders();
   
    this.http.post<PostTareaEnDemanda>(url, { observe: 'response', headers }).subscribe(
      (r) => {
        this.applog.ExitoT('componentes.visor-documento.crear-pdf-ack');
      },
      (err) => {

        if(err.status==400 || err.status==404)
        {
          this.applog.AdvertenciaT(`componentes.visor-documento.${err.error}`);
        } else {
          this.applog.FallaT(`${err.error}`);
        }
      },
    );
  }

  private getFileNameFromHttpResponse(httpResponse: HttpResponse<Blob>): string {
    var contentDispositionHeader = httpResponse.headers.get('Content-Disposition');
    var result = contentDispositionHeader.split(';')[1].trim().split('=')[1];
    return result.replace(/"/g, '');
  }

  public ObtieneDocumento(documentoId: string ): Observable<Documento> {
    const url = this.DepuraUrl(this.app.config.visordUrl) + `documento/${documentoId}`;
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
