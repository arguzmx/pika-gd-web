import { UnidadOrganizacionalActiva } from './unidad-organizacional-activa';

export interface DominioActivo {

    Id: string;
    Nombre: string;
    EsAdmin: boolean;
    UnidadesOrganizacionales?: UnidadOrganizacionalActiva[];
};