import { ValorPropiedad } from "./valor-propiedad";

export interface DocumentoPlantilla {
    Id: string,
    PlantillaId: string, 
    Valores: ValorPropiedad[],
    EsLista: boolean,
    ListaId: string,
    TipoOrigenId: string,
    OrigenId: string, 
    TipoDatoId: string, 
    DatoId: string,
    IndiceFiltrado: string
}