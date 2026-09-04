export enum TipoOperacionAPI {
    Crear = 1, ObtenerUnico = 2, Actualizar= 3, Eliminar = 4,
}

export class ResultadoAPI {
    ok: boolean;
    nombre: string;
    idoperacion: string;
    operacion: TipoOperacionAPI;
    error?: any;
    entidad?: any;
}
