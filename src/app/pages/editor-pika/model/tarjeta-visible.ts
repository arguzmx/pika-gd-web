
export const FILTRO_TARJETA_BUSCAR = 'buscar';
export const FILTRO_TARJETA_EDITAR = 'editar';

export enum VerboTarjeta {
    ninguno = 0, buscar = 1, editar = 2, adicionar = 3, eliminar = 4,
}

export interface TarjetaVisible {
    FiltroUI: string;
    Verbo: VerboTarjeta;
    Visible: boolean;
    Nombre: string;
    Payload?: any;
}
