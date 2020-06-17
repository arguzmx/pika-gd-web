export enum TipoNotifiacion {
    Ninguna = 0, Aviso = 1, Advertencia = 2 , Error = 3,
}

export class Notificacion {
    Mensaje: string;
    Titulo: string;
    Tipo: TipoNotifiacion;
}
