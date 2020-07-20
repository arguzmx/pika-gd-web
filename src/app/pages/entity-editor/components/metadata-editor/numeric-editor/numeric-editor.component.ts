import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ConfiguracionEntidad } from '../../../model/configuracion-entidad';
import { ICampoEditable } from '../../../model/i-campo-editable';
import { Propiedad, tDouble, tInt64, tInt32 } from '../../../../../@pika/metadata';

@Component({
  selector: 'ngx-numeric-editor',
  templateUrl: './numeric-editor.component.html',
  styleUrls: ['./numeric-editor.component.scss']
})
export class NumericEditorComponent implements ICampoEditable, OnInit {

  mask: string = 'separator.4';
  negativos: boolean = true;

  constructor() { }
  propiedad: Propiedad;
  group: FormGroup;
  isUpdate: boolean;
  congiguracion: ConfiguracionEntidad;

ngOnInit(): void {
    switch (this.propiedad.TipoDatoId) {
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
