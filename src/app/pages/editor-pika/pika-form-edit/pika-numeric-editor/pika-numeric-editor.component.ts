import { Propiedad } from './../../../../@pika/metadata/propiedad';
import { Component, OnInit } from '@angular/core';
import { CampoEditable } from '../../model/campo';
import { FormGroup } from '@angular/forms';
import { tDouble, tInt64, tInt32 } from '../../../../@pika/metadata';

@Component({
  selector: 'ngx-pika-numeric-editor',
  templateUrl: './pika-numeric-editor.component.html',
  styleUrls: ['./pika-numeric-editor.component.scss']
})
export class PikaNumericEditorComponent implements CampoEditable, OnInit {
  isUpdate: boolean;
  config: Propiedad;
  group: FormGroup;
  mask: string = 'separator.4';
  negativos: boolean = true;

  constructor() { }

ngOnInit(): void {
    switch (this.config.TipoDatoId) {
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
