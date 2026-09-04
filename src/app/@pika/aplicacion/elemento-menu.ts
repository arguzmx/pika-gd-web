import { ParametroMenu } from './parametro-menu';

export interface ElementoMenu {
    Indice: number;
    Titulo: string;
    Icono: string;
    URL: string;
    EsGrupo: boolean;
    EsHome: boolean;
    TokenApp: string;
    TokenMod: string;
    Hijos: ElementoMenu[];
    Parametros: ParametroMenu[];
}
