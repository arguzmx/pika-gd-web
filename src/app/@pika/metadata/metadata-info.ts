import { IProveedorReporte } from './iproveedor-reporte';
import { Propiedad } from './propiedad';
import { EntidadVinculada } from './entidad-vinculada';
import { CatalogoVinculado } from './catelogo-vinculado';
import { LinkVista } from './link-vista';

export class MetadataInfo {
    Tipo: string;
    FullName: string;
    ElminarLogico?: boolean;
    ColumaEliminarLogico?: string;
    PaginadoRelacional?: boolean;
    EntidadesVinculadas?: EntidadVinculada[];
    CatalogosVinculados?: CatalogoVinculado [];
    VistasVinculadas?: LinkVista[];
    Propiedades: Propiedad[];
    Reportes?:  IProveedorReporte[];
}
