import { TranslateService } from '@ngx-translate/core';

import { EditorService } from '../../services/editor-service';
import { FiltroConsulta, TextpOperador } from '../../../../@pika/consulta';
import { ComponenteBase } from '../../../../@core/comunes/componente-base';
import { first } from 'rxjs/operators';
import { AppLogService } from '../../../../@pika/servicios/app-log/app-log.service';

export class SearchFieldBase extends ComponenteBase {
  VALID_COLOR: string = 'success';
  INVALID_COLOR: string = 'basic';
  VALID_ICON: string = 'checkmark-circle-2';
  INVALID_ICON: string = 'checkmark-circle-2-outline';

  constructor(ts: TranslateService, 
    appLog: AppLogService, editorService: EditorService) {
    super(appLog, ts);
    this.editorService = editorService;
    this.filtro = {
      Negacion: false,
      Propiedad: '',
      Operador: null,
      Valor: [],
    };
  }

  editorService: EditorService;
  validstatus: string = this.INVALID_COLOR;
  validIcon: string = this.INVALID_ICON;
  filtro: FiltroConsulta;
  operadores: TextpOperador[] = [];

  ObtenerOperadores(ops: string[]): void {
    const keys = ops.map ( x =>  'operadores.' + x);
    this.translate.get(keys).pipe(first()).subscribe( res => {
      ops.forEach( x =>  {
        const t = res['operadores.' + x];
        this.operadores.push({ Texto: t, Operacion: x} );
      });
    });
 }

  setValidIcon(valid: boolean) {
    if (valid) {
      this.validstatus = this.VALID_COLOR;
      this.validIcon = this.VALID_ICON;
    } else {
      this.validIcon = this.INVALID_ICON;
      this.validstatus = this.INVALID_COLOR;
    }
  }

  checkChange(value) {
    this.filtro.Negacion = value;
    this.verificaFiltro();
  }

  opChange(value) {
    this.filtro.Operador = value;
    this.verificaFiltro();
  }

  inputChange(value: any) {
    if (this.filtro.Valor.length === 0) {
      this.filtro.Valor.push(value);
    } else {
      this.filtro.Valor[0] = value;
    }
    this.verificaFiltro();
  }

  input2Change(value: any) {
    if (this.filtro.Valor.length === 0) {
      this.filtro.Valor.push(null);
      this.filtro.Valor.push(value);
    } else {
      if (this.filtro.Valor.length === 1) {
        this.filtro.Valor.push(value);
      } else {
        this.filtro.Valor[1] = value;
      }
    }
    this.verificaFiltro();
  }

  setValorString(valor: string) {
    this.filtro.ValorString = valor;
  }

  verificaFiltro(): void {}
}
