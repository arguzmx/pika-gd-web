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
}
