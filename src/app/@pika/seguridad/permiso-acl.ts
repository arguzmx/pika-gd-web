export const PDENEGARACCESO = 1;
export const PLEER = 2;
export const PESCRIBIR = 4;
export const PELIMINAR = 8;
export const PADMINISTRAR = 16;
export const PEJECUTAR = 32;

export interface PermisoACL {
    ModuloId: string;
    Mascara: number;
}
