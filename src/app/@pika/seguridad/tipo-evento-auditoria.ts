export interface TipoEventoAuditoria {
    AppId: string,
    ModuloId: string,
    TipoEntidad: string,
    TipoEvento: number,
    Descripcion: string,
    PlantillaEvento: string,
    // Estas propiedades sólo existen en el fornt end para facilitar el CRUD
    Id?: string,
    Activo?: boolean
}