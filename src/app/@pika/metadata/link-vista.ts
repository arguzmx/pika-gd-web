export interface ParametroLinkVista {
    Vista: string;
    Multiple?: boolean;
}

export enum TipoVista
{
        Vista = 0,
        Comando = 1,
        EventoApp = 2,
        WebCommand = 3
}

export interface LinkVista {
    Vista: string;
    Icono: string;
    Titulo: string;
    RequiereSeleccion: boolean;
    Tipo: TipoVista;
    Condicion?: string;
}
