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
 
  format: string = '';
  constructor() {}

  ngOnInit(): void {
    const webcontrol = this.propiedad.AtributosVistaUI.find(
      (x) => x.Plataforma === 'web',
    );
    if (webcontrol) {
      switch (webcontrol.Control) {
        case HTML_DATE:
          this.format = 'calendar';
          break;
        case HTML_TIME:
          this.format = 'timer';
          break;
        case HTML_DATETIME:
          this.format = 'both';
          break;
      }
    }
  }
}
