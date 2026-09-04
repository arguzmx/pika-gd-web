export interface HighlightHit {
    Highlights: Highlight[];
    ElasticId: string;
    ElementoId: string;
}


export interface Highlight {
    ParteId: string;
    Pagina: number;
    Texto: string;
}

export interface HighlightProcesado {
    ParteNombre: string;
    ParteId: string;
    Pagina: string;
    Texto: string;
}