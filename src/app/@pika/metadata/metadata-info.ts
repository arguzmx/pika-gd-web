import { Propiedad } from './propiedad';
import { EntidadVinculada } from './entidad-vinculada';

export class MetadataInfo {
    Tipo: string;
    FullName: string;
    ElminarLogico?: boolean;
    ColumaEliminarLogico?: string;
    PaginadoRelacional?: boolean;
    EntidadesVinculadas?: EntidadVinculada[];
    Propiedades: Propiedad[];
}
