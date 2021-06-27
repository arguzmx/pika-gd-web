export interface ParametroLinkVista {
    Vista: string;
}

export enum TipoVista
{
        Vista = 0,
        Comando = 1,
        EventoApp = 2
}

export interface LinkVista {
    Vista: string;
    Icono: string;
    Titulo: string;
    RequiereSeleccion: boolean;
    Tipo: TipoVista;
}
