import { PayloadItem } from "../../@pika/eventos/evento-aplicacion";

export interface IUploadConfig {
    Nombre: string;
    ElementoId: string;
    VolumenId: string;
    PuntoMontajeId: string;
    CarpetaId: string;
    TransactionId: string;
    VersionId: string;
    parametros: PayloadItem[];
}
