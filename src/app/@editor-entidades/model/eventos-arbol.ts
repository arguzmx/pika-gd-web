import { Eventos } from '../../@pika/pika-module';

export enum EventosArbol
{
    CrearRaiz = 1, CrearHijo = 2, ActualizarTextoNodo = 3, EliminarNodo = 4,
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