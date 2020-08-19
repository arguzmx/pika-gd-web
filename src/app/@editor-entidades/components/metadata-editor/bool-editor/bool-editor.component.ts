import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ICampoEditable } from '../../../model/i-campo-editable';
import { Propiedad } from '../../../../@pika/pika-module';
import { ConfiguracionEntidad } from '../../../model/configuracion-entidad';

@Component({
  selector: 'ngx-bool-editor',
  templateUrl: './bool-editor.component.html',
  styleUrls: ['./bool-editor.component.scss']
})
export class BoolEditorComponent implements ICampoEditable, OnInit {
  isUpdate: boolean;
  propiedad: Propiedad;
  group: FormGroup;
  congiguracion: ConfiguracionEntidad;
  constructor() { }


  ngOnInit(): void {
  }

}
