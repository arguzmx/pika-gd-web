import { TraduccionAplicacionModulo } from './traduccion-aplicacion-modulo';
import { ModuloAplicacion } from './modulo-aplicacion';
import { TipoEventoAuditoria } from './tipo-evento-auditoria';

export interface Aplicacion {
    Id: string;
    Nombre: string;
    Descripcion: string;
    UICulture: string;
    Version: string;
    ReleaseIndex: number;
    Traducciones: TraduccionAplicacionModulo[];
    Modulos: ModuloAplicacion[];
}
