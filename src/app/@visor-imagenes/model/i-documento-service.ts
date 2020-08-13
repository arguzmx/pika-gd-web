import { Observable } from 'rxjs';
import { Documento } from './documento';

export interface IDocumentoService {
    ObtieneDocumento(documentoId: string ): Observable<Documento>;
}