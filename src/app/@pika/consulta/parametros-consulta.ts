export class ParametrosConsulta {

    constructor () {
        this.indice = 0;
        this.tamano = 10;
        this.ord_direccion = '';
        this.ord_columna = '';
        this.recalcular_totales = true;
        this.consecutivo = 0;
    }

    // Indice de la página soliicada
    indice: number;

    // Tamaño de la páginas o número máximo de elementos a devolver
    tamano: number;

    // Columna de ordenamiento
    ord_columna: string;

    // Dirección de ordenamiento
    ord_direccion: string;

    // Recaulcula los tptales para el paginado
    recalcular_totales: boolean;

    // Permite llevar un consecutivo de las peticiiones para refrescar los datos
    // Con la finalidad de mantener el orden el operaciones asincronas
    consecutivo: number;

}
