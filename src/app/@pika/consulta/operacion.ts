export enum  Operacion {
    OP_NONE = 'none', // Sin aoperador asignado
    OP_EQ = 'eq', // Operador de igualdad (=)
    OP_NEQ = 'neq', // Operador de desigualdad (!=)
    OP_GT = 'gt', // Operador mayor a (>)
    OP_GTE = 'gte', // Operador mayor o igual a (>=)
    OP_LT = 'lt', // Operador menor a (<)
    OP_LTE = 'lte', // Operador menor o igual a (<=)
    OP_EXIST = 'exists', // Operador existe en, aplica para listas de valores
    OP_CONTAINS = 'contains', // Operador contiene, aplica para localizar texto dentro de una cadena
    OP_STARTS = 'starts', // Operador comienza con
    OP_ENDS = 'ends', // Operador termina con
    OP_ISNULL = 'isnull', // Operador para detectar valores nulos
    OP_ISNOTNULL = 'notnull', // Operador para detectar valores no nulos
    OP_BETWEN = 'between', // interwvalo entre dos extrems
    OP_FULLTEXT = 'fulltext', // Busquyeda de tpexto compleoto
}
