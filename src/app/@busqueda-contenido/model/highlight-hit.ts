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