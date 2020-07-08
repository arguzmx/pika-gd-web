import { CampoEditable } from './../../model/campo';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Propiedad } from '../../../../@pika/metadata';

@Component({
  selector: 'ngx-pika-hidden-editor',
  templateUrl: './pika-hidden-editor.component.html',
  styleUrls: ['./pika-hidden-editor.component.scss']
})
export class PikaHiddenEditorComponent implements CampoEditable, OnInit {

  constructor() { }
  config: Propiedad;
  group: FormGroup;
  isUpdate: boolean;
  
  ngOnInit(): void {
  }

}
