export interface Pagina {
    Id: string;
    Nombre: string;
    Indice: number;
    Extension: string;
    EsImagen: boolean;
    Url: string;
    UrlThumbnail: string;
    TamanoBytes: number;
    Alto?: number;
    Ancho?: number;
    Rotacion?: number;
    EsAudio: boolean;
    EsVideo: boolean;
    EsPDF: boolean;
    TieneMiniatura: boolean;
    Indexada: boolean;
    VolumenId: string;
    ElementoId?: string;
}

export enum OperacionHeader {
    GIRAR_DER = 0,
    GIRAR_IZQ = 1,
    GIRAR_180 = 2,
    REFLEJO_HOR = 3,
    REFLEJO_VER = 4,
}