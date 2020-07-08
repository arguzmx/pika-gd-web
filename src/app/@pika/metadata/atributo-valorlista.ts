import { ValorListaOrdenada } from './valor-lista';
export class AtributoLista {
    PropiedadId: string;
    Entidad: string;
    DatosRemotos: boolean;
    TypeAhead: boolean;
    OrdenarAlfabetico: boolean;
    Default: string;
    Valores?: ValorListaOrdenada[];
}
