import { ValorListaOrdenada } from './valor-lista';
export class AtributoLista {
    PropiedadId: string;
    Entidad: string;
    DatosRemotos: boolean;
    TypeAhead: boolean;
    EsListaTemas?: boolean;
    FiltroBusqueda?: boolean;
    OrdenarAlfabetico: boolean;
    Default: string;
    ValoresCSV?: string;
    Valores?: ValorListaOrdenada[];
    Endpoint?: string;
}
