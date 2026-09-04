import { TipoEventoAuditoria } from "../../@pika/seguridad/tipo-evento-auditoria";

 export interface QueryBitacora {
    AppId?: string,
    ModuloId?: string,
    Eventos?: TipoEventoAuditoria[],
    UsuarioIds?: string[],
    FechaInicial?: Date,
    FechaFinal?: Date,
    CampoOrdenamiento?: string,
    ModoOrdenamiento?: string,
    Indice?: number,
    TamanoPagina?: number 
 }