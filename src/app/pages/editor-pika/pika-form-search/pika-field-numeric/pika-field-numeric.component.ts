import { Component, OnInit, OnChanges } from '@angular/core';
import { Campo } from '../search-fields/search-fields.directive';
import { ConfigCampo } from '../search-fields/config-campo';
import { FormGroup } from '@angular/forms';
import { TextpOperador } from './../../../../@pika/consulta/texto-operador';
import { OperadoresBusqueda } from '../../../../@pika/consulta/operadores-busqueda';
import { Operacion } from '../../../../@pika/consulta/operacion';
import { tDouble, tInt32, tInt64 } from '../../../../@pika/metadata';
import { SearchFieldBase } from '../search-fields/search-field-base';
import { EditorService } from '../../services/editor-service';

@Component({
  selector: 'ngx-pika-field-numeric',
  templateUrl: './pika-field-numeric.component.html',
  styleUrls: ['./pika-field-numeric.component.scss'],
})
export class PikaFieldNumericComponent extends SearchFieldBase
  implements OnInit, Campo {
  isBetween: boolean = false;
  operadores: TextpOperador[] = OperadoresBusqueda.Numerico();
  config: ConfigCampo;
  group: FormGroup;
  mask: string = 'separator.4';

  constructor(editorService: EditorService) {
    super(editorService);
  }

  verificaFiltro(): void {
    let valid: boolean = true;
    if (this.filtro.Operador == null) valid = false;

    if (valid) {
      if (this.filtro.Operador === Operacion.OP_BETWEN.toString()) {
        if (this.filtro.Valor.length < 2) {
          valid = false;
        } else {
          valid = !(isNaN(this.filtro.Valor[0]) || isNaN(this.filtro.Valor[1]));
        }
      } else {
        valid = !isNaN(this.filtro.Valor[0]);
      }
    }

    this.setValidIcon(valid);
    if (valid) {
      this.editorService.AgregarFiltro(this.filtro);
    } else {
      this.editorService.InvalidarFiltro(this.filtro);
    }
  }

  closeFilter(): void {
    this.editorService.EliminarFiltro(this.config);
  }

  toggleBetween(value) {
    this.isBetween = value === Operacion.OP_BETWEN.toString() ? true : false;
    this.opChange(value);
  }

  valor1(valor): void {
    this.inputChange(valor.srcElement.value);
  }

  valor2(valor): void {
    this.input2Change(valor.srcElement.value);
  }
  ngOnInit(): void {
    this.filtro.Propiedad = this.config.Id;
    this.filtro.Id = this.config.name;
    switch (this.config.type) {
      case tDouble:
        this.mask = 'separator.4';
        break;

      case tInt64:
      case tInt32:
        this.mask = 'separator.0';
        break;
    }
  }
}
