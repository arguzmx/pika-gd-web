export interface PostTareaEnDemanda {
    Id: string,
    Tipo: string,
    Fecha: Date,
    PickupURL: string,
    Completado: boolean,
    ConError: boolean,
    Error: string,
    Etiqueta: string,
    TipoRespuesta: number
}
