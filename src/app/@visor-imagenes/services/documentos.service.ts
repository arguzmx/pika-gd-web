import { environment } from './../../../environments/environment';
import { Pagina } from './../model/pagina';
import { Observable, BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Documento } from '../model/documento';
import { IDocumentoService } from '../model/i-documento-service';

@Injectable()
export class DocumentosService implements IDocumentoService {

  constructor(private http: HttpClient) { }

  public ObtieneDocumento(documentoId: string ): Observable<Documento> {
    const url = this.DepuraUrl(environment.visordUrl) + `documento/${documentoId}`;
      return this.http.get<Documento>(url);
  }

  private DepuraUrl(url: string): string {
    return url.replace(/\/$/, '') + '/';
  }

}
