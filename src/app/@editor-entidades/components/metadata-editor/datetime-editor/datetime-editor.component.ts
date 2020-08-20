import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ICampoEditable } from '../../../model/i-campo-editable';
import {
  Propiedad,
  HTML_DATE,
  HTML_TIME,
  HTML_DATETIME,
} from '../../../../@pika/pika-module';
import { ConfiguracionEntidad } from '../../../model/configuracion-entidad';

@Component({
  selector: 'ngx-datetime-editor',
  templateUrl: './datetime-editor.component.html',
  styleUrls: ['./datetime-editor.component.scss'],
})
export class DatetimeEditorComponent implements ICampoEditable, OnInit {
  isUpdate: boolean;
  propiedad: Propiedad;
  congiguracion: ConfiguracionEntidad;
  group: FormGroup;
  isDateTime: boolean = false;
  isDate: boolean = false;
  isTime: boolean = false;

  constructor() {}

  ngOnInit(): void {
    const webcontrol = this.propiedad.AtributosVistaUI.find(
      (x) => x.Plataforma === 'web',
    );
    this.isDate = true;
    if (webcontrol) {
      switch (webcontrol.Control) {
        case HTML_DATE:
          break;
        case HTML_TIME:
          this.isDateTime = false;
          this.isDate = false;
          this.isTime = true;
          break;
        case HTML_DATETIME:
          this.isDateTime = true;
          this.isDate = false;
          this.isTime = false;
          break;
      }
    }
  }
}
