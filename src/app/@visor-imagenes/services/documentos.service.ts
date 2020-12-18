import { MetadataInfo } from './../../@pika/metadata/metadata-info';
import { Plantilla } from './../model/plantilla';
import { environment } from './../../../environments/environment';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Documento } from '../model/documento';
import { IDocumentoService } from '../model/i-documento-service';

@Injectable()
export class DocumentosService implements IDocumentoService {

  private endpointPlantilla: string;

  constructor(private http: HttpClient) {

    this.endpointPlantilla = this.DepuraUrl(environment.apiUrl) + `metadatos/`;

  }

  public ObtieneDocumento(documentoId: string ): Observable<Documento> {
    const url = this.DepuraUrl(environment.visordUrl) + `documento/${documentoId}`;
    return this.http.get<Documento>(url);
  }

  public ObtienePlantillas(): Observable<Plantilla[]> {
    const url = this.DepuraUrl(this.endpointPlantilla ) + 'plantillas/' ;
    return this.http.get<Plantilla[]>(url);
  }

  public ObtieneMetadataInfo(id: string): Observable<MetadataInfo> {
    const url = this.DepuraUrl(this.endpointPlantilla ) + id;
    return this.http.get<MetadataInfo>(url);
  }

  private DepuraUrl(url: string): string {
    return url.replace(/\/$/, '') + '/';
  }

}
