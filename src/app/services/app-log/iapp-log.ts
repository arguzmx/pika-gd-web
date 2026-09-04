export interface IAppLog {

    Informacion(titulo: string, mensaje: string): void;
    Exito(titulo: string, mensaje: string): void;
    Advertencia(titulo: string, mensaje: string): void;
    Falla(titulo: string, mensaje: string): void;

    InformacionT(clave: string, titulo?: string, interpolateParams?: Object): void;
    ExitoT(clave: string, titulo?: string, interpolateParams?: Object): void;
    AdvertenciaT(clave: string, titulo?: string, interpolateParams?: Object): void;
    FallaT(clave: string, titulo?: string, interpolateParams?: Object): void;

}
