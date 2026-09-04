import { ElementoMenu } from './elemento-menu';

export interface MenuAplicacion {
    AppId: string;
    AppNombre: string;
    Elementos: ElementoMenu[];
}