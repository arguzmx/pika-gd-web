export interface PermisoPuntoMontaje {
    Id: string,
    PuntoMontajeId: string,
    DestinatarioId: string,
    Leer: boolean,
    Crear: boolean,
    Actualizar: boolean,
    Elminar: boolean,
    GestionContenido: boolean,
    GestionMetadatos: boolean
}