import { Propiedad } from './../../../../@pika/metadata/propiedad';
import {
  tList,
  tDate,
  tDateTime,
  tTime,
  tBoolean,
  tDouble,
  tInt32,
  tInt64,
  tString,
} from '../../../../@pika/metadata';
import { ValorLista } from '../../../../@pika/metadata/valor-lista';

export class EditorMockProps {
  static GetCampos(): Propiedad[] {
    const Propiedades: Propiedad[] = [];
    let p = null;

    p = this.FakeProp('idlista', 'Tipo lisya', tList);
    p.ValoresLista = this.vlist();
    Propiedades.push(p);

    p = this.FakeProp('iddate', 'Tipo fecha', tDate);
    Propiedades.push(p);

    p = this.FakeProp('iddatetime', 'Tipo fecha-hora', tDateTime);
    Propiedades.push(p);

    p = this.FakeProp('idhora', 'Tipo hora', tTime);
    Propiedades.push(p);

    p = this.FakeProp('idbool', 'Tipo boolenao', tBoolean);
    Propiedades.push(p);

    p = this.FakeProp('iddocuble', 'Tipo doble', tDouble);
    Propiedades.push(p);

    p = this.FakeProp('int32', 'Tipo int 32', tInt32);
    Propiedades.push(p);

    p = this.FakeProp('int64', 'Tipo int 64', tInt64);
    Propiedades.push(p);

    p = this.FakeProp('idstring', 'Tipo string', tString);
    Propiedades.push(p);

    return Propiedades;
  }

  static vlist(): ValorLista[] {
    const v: ValorLista[] = [];

    v.push({
      Id: '01',
      Texto: 'Valor 01',
      Indice: 0,
    });

    v.push({
      Id: '02',
      Texto: 'Valor 02',
      Indice: 1,
    });

    v.push({
      Id: '03',
      Texto: 'Valor 03',
      Indice: 2,
    });

    return v;
  }

  static FakeProp(id: string, n: string, t: string): Propiedad {
    return {
      Id: id,
      Nombre: n,
      TipoDatoId: t,
      ValorDefault: null,
      IndiceOrdenamiento: 0,
      Buscable: true,
      Ordenable: true,
      Visible: true,
      EsIdClaveExterna: false,
      EsIdRegistro: false,
      EsIdJerarquia: false,
      EsTextoJerarquia: false,
      EsIdPadreJerarquia: false,
      EsFiltroJerarquia: false,
      Requerido: false,
      Autogenerado: false,
      EsIndice: false,
      ControlHTML: 'textbox',
      TipoDato: null,
      ValidadorTexto: null,
      ValidadorNumero: null,
      Atributos: [],
      MostrarEnTabla: true,
      AlternarEnTabla: true,
      IndiceOrdenamientoTabla: 1,
    };
  }
}
