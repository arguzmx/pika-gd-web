import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ICampoEditable } from '../../../model/i-campo-editable';
import { Propiedad, tDate, tTime } from '../../../../../@pika/metadata';
import { ConfiguracionEntidad } from '../../../model/configuracion-entidad';


@Component({
  selector: 'ngx-datetime-editor',
  templateUrl: './datetime-editor.component.html',
  styleUrls: ['./datetime-editor.component.scss']
})
export class DatetimeEditorComponent implements ICampoEditable, OnInit {
  isUpdate: boolean;
  propiedad: Propiedad;
  congiguracion: ConfiguracionEntidad;
  group: FormGroup;
  isDateTime: boolean = true;
  isDate: boolean = false;
  isTime: boolean = false;

  constructor() { }


  ngOnInit(): void {
    switch (this.propiedad.TipoDatoId) {
      case tDate:
        this.isDateTime = false;
        this.isDate = true;
        break;

      case tTime:
        this.isDateTime = false;
        this.isTime = true;
        break;
    }
  }

}
