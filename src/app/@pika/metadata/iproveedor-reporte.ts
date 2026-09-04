import { ParametroReporte } from './parametro-reporte';
import { FormatoReporte } from './formato-reporte';

export interface IProveedorReporte {
    Nombre: string;
    Parametros: ParametroReporte[];
    Url: string;
    FormatosDisponibles: FormatoReporte[];
}
