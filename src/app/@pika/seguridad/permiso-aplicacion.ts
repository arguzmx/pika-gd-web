export interface PermisoAplicacion {
    DominioId: string;
    AplicacionId: string;
    ModuloId: string;
    TipoEntidadAcceso: string;
    EntidadAccesoId: string;
    NegarAcceso: boolean;
    Leer: boolean;
    Escribir: boolean;
    Eliminar: boolean;
    Admin: boolean;
    Ejecutar: boolean;
}
