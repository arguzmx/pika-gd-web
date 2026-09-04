export interface RespuestaImportacion 
{
    Archivo:string,
    Error: string,
    FechaInicio: Date,
    FechaFin: Date,
    Total: number,
    Ok: number,
    Erroneos: number
}