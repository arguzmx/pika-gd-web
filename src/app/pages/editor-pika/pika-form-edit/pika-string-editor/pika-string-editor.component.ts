import { Propiedad } from './../../../../@pika/metadata/propiedad';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CampoEditable } from '../../model/campo';

@Component({
  selector: 'ngx-pika-string-editor',
  templateUrl: './pika-string-editor.component.html',
  styleUrls: ['./pika-string-editor.component.scss']
})
export class PikaStringEditorComponent implements CampoEditable, OnInit {

  config: Propiedad;
  group: FormGroup;
  constructor() { }

  ngOnInit(): void {
  }

}
