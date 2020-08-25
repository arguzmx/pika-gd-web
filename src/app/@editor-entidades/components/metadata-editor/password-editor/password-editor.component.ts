import { EntidadesService } from './../../../services/entidades.service';
import { EditorCampo } from './../editor-campo';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ICampoEditable } from '../../../model/i-campo-editable';

@Component({
  selector: 'ngx-password-editor',
  templateUrl: './password-editor.component.html',
  styleUrls: ['./password-editor.component.scss']
})
export class PasswordEditorComponent
extends EditorCampo
implements ICampoEditable, OnInit, OnDestroy {
  @ViewChild('validfield') validfield: any;

  isConfirm: boolean = false;
  propConfName: string = '';
  propValidName: string = '';
  match: boolean = false;

  constructor(entidades: EntidadesService) {
    super(entidades);
  }

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

  ngOnDestroy(): void {
    this.destroy();
  }

  ngOnInit(): void {
    this.hookEscuchaEventos();
    this.isConfirm = (this.propiedad.ControlHTML === 'passconfirm');
    this.propConfName = this.propiedad.Id + 'conf';
    this.propValidName = this.propiedad.Id + 'valid';
  }

}
