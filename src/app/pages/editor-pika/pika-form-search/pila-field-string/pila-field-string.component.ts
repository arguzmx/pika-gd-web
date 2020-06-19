import { Propiedad } from './../../../../@pika/metadata/propiedad';
import { CampoBuscable, CTL_OP_PREFIX, CTL_NEG_PREFIX, CTL1_PREFIX, CTL2_PREFIX } from './../../model/campo';
import { Component, OnInit, OnChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TextpOperador } from './../../../../@pika/consulta/texto-operador';
import { OperadoresBusqueda } from '../../../../@pika/consulta/operadores-busqueda';
import { SearchFieldBase } from '../search-fields/search-field-base';
import { EditorService } from '../../services/editor-service';

@Component({
  selector: 'ngx-pila-field-string',
  styleUrls: ['./pila-field-string.component.scss'],
  templateUrl: './pila-field-string.component.html',
})
export class PikaFieldStringComponent extends SearchFieldBase implements OnInit, 
CampoBuscable {

  operadores: TextpOperador[] = OperadoresBusqueda.Texto();
  config: Propiedad;
  group: FormGroup;
  ctl1Id: string;
  ctl2Id: string;
  negCtlId: string;
  opCtlId: string;

  constructor(editorService: EditorService) {
    super(editorService);
  }

  verificaFiltro(): void {
    let valid: boolean = true;
    if (this.filtro.Operador == null) valid = false;

    if (valid) {
      if (this.filtro.Valor.length === 0) {
        valid = false;
      } else {
        if ( (this.filtro.Valor[0] === null) || (this.filtro.Valor[0] === '' )) {
          valid = false;
        }
      }
    }
    this.setValorString(null);
    this.setValidIcon(valid);
    if (valid) {
      this.setValorString(this.filtro.Valor[0]);
      this.editorService.AgregarFiltro(this.filtro);
    } else {
      this.editorService.InvalidarFiltro(this.filtro);
    }
  }

  closeFilter(): void {
    this.editorService.EliminarFiltro(this.config);
  }


  valor1(valor): void {
    this.inputChange(valor.srcElement.value);
  }


  ngOnInit(): void {
    this.filtro.Propiedad = this.config.Id;
    this.filtro.Id = this.config.Id;

    this.opCtlId = CTL_OP_PREFIX + this.config.Id;
    this.negCtlId = CTL_NEG_PREFIX + this.config.Id;
    this.ctl1Id = CTL1_PREFIX + this.config.Id;
    this.ctl2Id = CTL2_PREFIX + this.config.Id;
  }
}
