import { FiltroConsulta } from "../../@pika/consulta";

export enum EstadoBusqueda {
    Nueva = 0, EnEjecucion = 1, Finaliza = 3, FinalizadaError = 10
}

export interface BusquedaContenido {
    Id: string;
    Elementos: Busqueda[];
    Fecha: Date;
    FechaFinalizado: Date;
    Estado: EstadoBusqueda;
}

export interface Busqueda {
    Tag: string;
    Topico: string;
    Consulta: Consulta
    Conteo?: number;
    Ids?: string[];
}

export interface Consulta {
    Filtros: FiltroConsulta[]
}