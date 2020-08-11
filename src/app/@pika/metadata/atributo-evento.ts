export enum Eventos
{
    AlCambiar = 1,
}

export enum Operaciones
{
    Actualizar = 1,
}

export interface AtributoEvento {
    PropiedadId: string;
    Entidad: string;
    Parametro: string;
    Operacion: Operaciones;
    Evento: Eventos;
    Payload?: any;
}

export enum EventosArbol
{
    CrearRaiz = 1, CrearHijo = 2, ActualizarTextoNodo = 3, EliminarNodo = 4,
}


export interface  Evento {
    Origen: string;
    Valor: any;
    Evento: Eventos;
    Transaccion?: string;
}

export interface  EventoArbol {
    Origen: any;
    Valor: any;
    Evento: EventosArbol;
    Transaccion?: string;
}

export interface  EventoContexto {
    Origen: string;
    Valor: any;
}
