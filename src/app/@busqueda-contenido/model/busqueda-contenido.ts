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
    PuntoMontajeId: string;
    indice: number;
    tamano: number;
    consecutivo: number;
    ord_columna: string;
    ord_direccion: string;
    recalcular_totales: boolean;
    PlantillaId?: string;
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