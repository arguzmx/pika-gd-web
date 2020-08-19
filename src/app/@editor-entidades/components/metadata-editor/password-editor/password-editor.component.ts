import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ICampoEditable } from '../../../model/i-campo-editable';
import { Propiedad } from '../../../../@pika/pika-module';
import { ConfiguracionEntidad } from '../../../model/configuracion-entidad';

@Component({
  selector: 'ngx-password-editor',
  templateUrl: './password-editor.component.html',
  styleUrls: ['./password-editor.component.scss']
})
export class PasswordEditorComponent implements ICampoEditable, OnInit {
  @ViewChild('validfield') validfield: any;

  propiedad: Propiedad;
  congiguracion: ConfiguracionEntidad;
  group: FormGroup;
  isUpdate: boolean;
  isConfirm: boolean = false;
  propConfName: string = '';
  propValidName: string = '';
  match: boolean = false;
  constructor() { }

  private texto1: string = '';
  private texto2: string = '';

  valor1(texto: any) {
    this.texto1 = texto.srcElement.value;
    this.validaConfirm();
  }

  valor2(texto: any) {
    this.texto2 = texto.srcElement.value;
    this.validaConfirm();
  }

  private validaConfirm(): void {
    if (this.isConfirm) {
        if (this.texto1 === this.texto2) {
          this.match = true;
          this.group.get(this.propValidName).setValue('done');
        } else {
          this.match = false;
          this.group.get(this.propValidName).setValue('');
        }
    }
  }

  ngOnInit(): void {
    this.isConfirm = (this.propiedad.ControlHTML === 'passconfirm');
    this.propConfName = this.propiedad.Id + 'conf';
    this.propValidName = this.propiedad.Id + 'valid';
  }

}
