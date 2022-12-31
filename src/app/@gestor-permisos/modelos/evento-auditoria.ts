export interface EventoAuditoria {
    Id: number,
    Fecha: Date,
    DireccionRed: string,
    IdSesion: string,
    UsuarioId: string,
    DominioId: string,
    UAId: string,
    Exitoso: boolean,
    Fuente?: string,
    AppId: string,
    ModuloId: string,
    TipoEvento: number,
    TipoFalla?: number,
    TipoEntidad?: string,
    IdEntidad?: string,
    NombreEntidad?: string,
    Delta?: string,
    TipoEventoTexto?: string
}