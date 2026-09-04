import { PermisoAplicacion } from './permiso-aplicacion';
export interface RespuestaPermisos {
    Id: string;
    EsAdmmin: boolean;
    Permisos: PermisoAplicacion[]
}