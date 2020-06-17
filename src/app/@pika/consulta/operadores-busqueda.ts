import { Consulta } from './consulta';
import { Operacion } from './operacion';
import { TextpOperador } from './texto-operador';

export class OperadoresBusqueda {

    public static Texto(): TextpOperador[] {
        const operadores = [];
        operadores.push( Consulta.TextoOperacion(Operacion.OP_EQ, ''));
        operadores.push( Consulta.TextoOperacion(Operacion.OP_CONTAINS, ''));
        operadores.push( Consulta.TextoOperacion(Operacion.OP_ENDS, ''));
        operadores.push( Consulta.TextoOperacion(Operacion.OP_STARTS, ''));
        operadores.push( Consulta.TextoOperacion(Operacion.OP_FULLTEXT, ''));
        return operadores;
    }

    public static Numerico(): TextpOperador[] {
        const operadores = [];
        operadores.push( Consulta.TextoOperacion(Operacion.OP_EQ, ''));
        operadores.push( Consulta.TextoOperacion(Operacion.OP_BETWEN, ''));
        operadores.push( Consulta.TextoOperacion(Operacion.OP_GT, ''));
        operadores.push( Consulta.TextoOperacion(Operacion.OP_GTE, ''));
        operadores.push( Consulta.TextoOperacion(Operacion.OP_LT, ''));
        operadores.push( Consulta.TextoOperacion(Operacion.OP_LTE, ''));
        return operadores;
    }


    public static FechaHora(): TextpOperador[] {
        const operadores = [];
        operadores.push( Consulta.TextoOperacion(Operacion.OP_EQ, ''));
        operadores.push( Consulta.TextoOperacion(Operacion.OP_BETWEN, ''));
        operadores.push( Consulta.TextoOperacion(Operacion.OP_GT, ''));
        operadores.push( Consulta.TextoOperacion(Operacion.OP_GTE, ''));
        operadores.push( Consulta.TextoOperacion(Operacion.OP_LT, ''));
        operadores.push( Consulta.TextoOperacion(Operacion.OP_LTE, ''));
        return operadores;
    }

    public static Booleano(): TextpOperador[] {
        const operadores = [];
        operadores.push( Consulta.TextoOperacion(Operacion.OP_EQ, ''));
        return operadores;
    }

    public static Lista(): TextpOperador[] {
        const operadores = [];
        operadores.push( Consulta.TextoOperacion(Operacion.OP_EQ, ''));
        return operadores;
    }
}
