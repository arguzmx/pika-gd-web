export interface EventoAplicacion {
    id: string;
    tema: string;
    payload: PayloadItem[];
}

export interface PayloadItem {
    id: string;
    valor: string;
    valores: any[];
}
