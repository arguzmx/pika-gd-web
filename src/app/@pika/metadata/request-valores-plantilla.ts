import { ValorPropiedad } from "./valor-propiedad";

export interface RequestValoresPlantilla {
    Tipo: string,
    Id: string,
    Filtro: string,
    FiltroJerarquico: string,
    Valores: ValorPropiedad[]
}