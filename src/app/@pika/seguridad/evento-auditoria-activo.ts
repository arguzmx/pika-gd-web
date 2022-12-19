export interface EventoAuditoriaActivo {
    Id: string,
    DominioId: string,
    UAId: string,
    AppId: string,
    ModuloId: string,
    TipoEntidad: string,
    TipoEvento: number,
    Auditar: boolean
}