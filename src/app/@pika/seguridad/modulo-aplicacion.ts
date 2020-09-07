import { TraduccionAplicacionModulo } from './traduccion-aplicacion-modulo';

export enum TipoModulo {
    Administracion = 0, UsuarioFinal = 1,
}

export interface ModuloAplicacion {
    Id: string;
    AplicacionId: string;
    Nombre: string;
    Descripcion: string;
    UICulture: string;
    Asegurable: boolean;
    ModuloPadreId: string;
    AplicacionPadreId: string;
    Icono: string;
    PermisosDisponibles: number;
    Tipo: TipoModulo;
    Modulos: ModuloAplicacion[];
    Traducciones: TraduccionAplicacionModulo[];
}

