export interface IDiccionarioNavegacion {
    urlPorNombre(nombre: string): string;
}

export abstract class DiccionarioNavegacion implements IDiccionarioNavegacion {
    abstract  urlPorNombre(nombre: string): string;
}
