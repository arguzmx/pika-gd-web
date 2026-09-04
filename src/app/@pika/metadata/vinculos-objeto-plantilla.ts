export interface VinculosObjetoPlantilla {
    _Id: string,
    Tipo: string,
    Id: string,
    Documentos: VinculoDocumentoPlantilla[],
    Listas: VinculoListaPlantilla[]
}

export interface VinculoDocumentoPlantilla {
    PlantillaId: string,
    DocumentoId: string,
    Nombre: string
}

export interface VinculoListaPlantilla {
    PlantillaId: string,
    ListaId: string,
    Nombre: string
}