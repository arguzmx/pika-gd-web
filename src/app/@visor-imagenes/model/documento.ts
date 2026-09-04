import { Pagina } from './pagina';

export interface Documento {
    Id: string;
    VersionId: string;
    Nombre: string;
    Paginas: Pagina[];
}
