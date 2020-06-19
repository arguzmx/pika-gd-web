import { Propiedad } from './../../../../@pika/metadata/propiedad';
import { Component, OnInit } from '@angular/core';
import { CampoEditable } from '../../model/campo';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'ngx-pika-bool-editor',
  templateUrl: './pika-bool-editor.component.html',
  styleUrls: ['./pika-bool-editor.component.scss']
})
export class PikaBoolEditorComponent implements CampoEditable, OnInit {

  config: Propiedad;
  group: FormGroup;
  constructor() { }

  ngOnInit(): void {
  }

}
