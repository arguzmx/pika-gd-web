import { LinkVista } from "./metadata";

export interface Menu {
    MenuId: string;
    MenuIndex: number;
    Icono: string;
    Titulo: string;
    Condicion?: string;
    Links?: LinkVista[]
}