export enum Eventos
{
    AlCambiar = 1,
}

export enum Operaciones
{
    Actualizar = 1, Mostrar = 10,
}

export interface AtributoEvento {
    PropiedadId: string;
    Entidad: string;
    Parametro: string;
    Operacion: Operaciones;
    Evento: Eventos;
    Payload?: any;
}

export interface  Evento {
    Origen: string;
    Valor: any;
    Evento: Eventos;
    Transaccion?: string;
}
