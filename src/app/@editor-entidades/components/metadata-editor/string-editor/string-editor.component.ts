import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ICampoEditable } from '../../../model/i-campo-editable';
import { Propiedad } from '../../../../@pika/pika-module';
import { ConfiguracionEntidad } from '../../../model/configuracion-entidad';

@Component({
  selector: 'ngx-string-editor',
  templateUrl: './string-editor.component.html',
  styleUrls: ['./string-editor.component.scss']
})
export class StringEditorComponent implements ICampoEditable, OnInit {

  propiedad: Propiedad;
  congiguracion: ConfiguracionEntidad;
  group: FormGroup;
  isUpdate: boolean;
  isTextArea: boolean = false;

  constructor() { }



  ngOnInit(): void {
    this.isTextArea = (this.propiedad.ControlHTML === 'textarea');
  }

}
