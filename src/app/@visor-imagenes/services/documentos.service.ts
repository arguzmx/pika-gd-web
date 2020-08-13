import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Documento } from '../model/documento';
import { IDocumentoService } from '../model/i-documento-service';

@Injectable()
export class DocumentosService implements IDocumentoService {

  constructor(private http: HttpClient) { }

  public ObtieneDocumento(documentoId: string ): Observable<Documento> {
      return this.http.get<Documento>('http://localhost/assets/demo-documento/documento.json');
  }

}
