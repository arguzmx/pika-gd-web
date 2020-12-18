import { Observable } from 'rxjs';
import { Documento } from './documento';
import { Plantilla } from './plantilla';

export interface IDocumentoService {
    ObtieneDocumento(documentoId: string ): Observable<Documento>;
    ObtienePlantillas(): Observable<Plantilla[]>;
    ObtieneMetadataInfo(id: string): Observable<unknown>;
}
