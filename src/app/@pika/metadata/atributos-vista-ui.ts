import { Acciones } from './acciones-crud';

export const PLATAFORMA_WEB = 'web';

export interface AtributoVistaUI {
    PropiedadId: string;
    Control: string;
    Accion: Acciones;
    Plataforma: string;
}
