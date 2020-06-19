import { Component, OnInit } from '@angular/core';
import { CampoEditable } from '../../model/campo';
import { FormGroup } from '@angular/forms';
import { tTime, tDate, Propiedad } from '../../../../@pika/metadata';

@Component({
  selector: 'ngx-pika-datetime-editor',
  templateUrl: './pika-datetime-editor.component.html',
  styleUrls: ['./pika-datetime-editor.component.scss']
})
export class PikaDatetimeEditorComponent implements CampoEditable, OnInit {

  config: Propiedad;
  group: FormGroup;
  isDateTime: boolean = true;
  isDate: boolean = false;
  isTime: boolean = false;

  constructor() { }

  ngOnInit(): void {
    switch (this.config.TipoDatoId) {
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
