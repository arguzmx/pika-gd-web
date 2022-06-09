import { IProveedorReporte } from './iproveedor-reporte';
import { Propiedad } from './propiedad';
import { EntidadVinculada } from './entidad-vinculada';
import { CatalogoVinculado } from './catelogo-vinculado';
import { LinkVista } from './link-vista';
import { FiltroDefault } from './atributo-filtrodefault';


export enum TipoSeguridad
{
    Default = 0,
    AlIngreso = 1,
    AlCambiar = 2,
}
export class MetadataInfo {
    Tipo: string;
    FullName: string;
    ElminarLogico?: boolean;
    ColumaEliminarLogico?: string;
    PaginadoRelacional?: boolean;
    EntidadesVinculadas?: EntidadVinculada[];
    CatalogosVinculados?: CatalogoVinculado [];
    VistasVinculadas?: LinkVista[];
    AsociadoMetadatos: boolean;
    HabilitarSeleccion: boolean;
    Propiedades: Propiedad[];
    Reportes?:  IProveedorReporte[];
    TokenMod?: string;
    TokenApp?: string;
    PermiteAltas: boolean = true;
    PermiteBajas: boolean = true;
    PermiteCambios: boolean = true;
    TipoSeguridad: TipoSeguridad = TipoSeguridad.Default;
    FiltrosDefault: FiltroDefault[];
}
