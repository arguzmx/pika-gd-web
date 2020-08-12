import { Propiedad } from './propiedad';
import { EntidadVinculada } from './entidad-vinculada';
import { CatalogoVinculado } from './catelogo-vinculado';

export class MetadataInfo {
    Tipo: string;
    FullName: string;
    ElminarLogico?: boolean;
    ColumaEliminarLogico?: string;
    PaginadoRelacional?: boolean;
    EntidadesVinculadas?: EntidadVinculada[];
    CatalogosVinculados: CatalogoVinculado [];
    Propiedades: Propiedad[];
}
