export interface IAppLog {

    Informacion(titulo: string, mensaje: string): void;
    Exito(titulo: string, mensaje: string): void;
    Advertencia(titulo: string, mensaje: string): void;
    Falla(titulo: string, mensaje: string): void;

}
