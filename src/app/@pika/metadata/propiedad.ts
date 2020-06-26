import { TipoDato } from './tipo-dato';
import { AtributoTabla } from './atributo-tabla';
import { ValidadorTexto } from './validador-texto';
import { ValidadorNumero } from './validador-numero';
import { AtributoMetadato } from './atributo-metadato';
import { ValorLista } from './valor-lista';
import { AtributoListaValores } from './atributo-valorlista';

export interface Propiedad {
    Id: string;
    Nombre: string;
    NombreI18n?: string;
    TipoDatoId: string;
    ValorDefault?: string;
    IndiceOrdenamiento: number;
    Buscable: boolean;
    Ordenable: boolean;
    Visible: boolean;
    EsIdClaveExterna: boolean;
    EsIdRegistro: boolean;
    EsIdJerarquia: boolean;
    EsTextoJerarquia: boolean;
    EsIdPadreJerarquia: boolean;
    EsFiltroJerarquia: boolean;
    Requerido: boolean;
    Autogenerado: boolean;
    EsIndice: boolean;
    ControlHTML: string;
    TipoDato: TipoDato;
    AtributoTabla?: AtributoTabla;
    ValidadorTexto?: ValidadorTexto;
    ValidadorNumero?: ValidadorNumero;
    Atributos?: AtributoMetadato[];
    AtributoListaValores?: AtributoListaValores;
    ValoresLista?: ValorLista[];
    OrdenarValoresListaPorNombre?:  boolean;
    Valor?: string;
    AccionesCrud: number;
}
