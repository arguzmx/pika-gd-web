import { Component, OnInit } from '@angular/core';
import { CampoEditable } from '../../model/campo';
import { FormGroup } from '@angular/forms';
import { ValorLista } from '../../../../@pika/metadata/valor-lista';
import { Propiedad } from '../../../../@pika/metadata';

@Component({
  selector: 'ngx-pika-list-editor',
  templateUrl: './pika-list-editor.component.html',
  styleUrls: ['./pika-list-editor.component.scss']
})
export class PikaListEditorComponent implements CampoEditable, OnInit {

  config: Propiedad;
  group: FormGroup;
  list: ValorLista[];

  constructor() { }

  ngOnInit(): void {
    if (this.config.OrdenarValoresListaPorNombre) {
      this.list = this.Sort('Texto');
    } else {
      this.list = this.Sort('Indice');
    }
  }

  Sort(by: string) {
    return this.config.ValoresLista.sort((obj1, obj2) => {
      if (obj1[by] > obj2[by]) {
          return 1;
      }
      if (obj1[by] < obj2[by]) {
          return -1;
      }
      return 0;
  });
  }

}
