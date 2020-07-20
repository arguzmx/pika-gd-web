import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Propiedad } from '../../../../../@pika/metadata';
import { ConfiguracionEntidad } from '../../../model/configuracion-entidad';
import { ICampoEditable } from '../../../model/i-campo-editable';


@Component({
  selector: 'ngx-hidden-editor',
  templateUrl: './hidden-editor.component.html',
  styleUrls: ['./hidden-editor.component.scss']
})
export class HiddenEditorComponent implements ICampoEditable, OnInit {

  constructor() { }
  propiedad: Propiedad;
  group: FormGroup;
  isUpdate: boolean;
  congiguracion: ConfiguracionEntidad;

  ngOnInit(): void {
  }

}
