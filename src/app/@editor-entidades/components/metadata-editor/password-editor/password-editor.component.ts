import { EditorCampo } from './../editor-campo';
import { Component, OnInit, ViewChild, OnDestroy, HostBinding } from '@angular/core';
import { ICampoEditable } from '../../../model/i-campo-editable';
import { EventosInterprocesoService } from '../../../services/eventos-interproceso.service';
import { AppLogService } from '../../../../services/app-log/app-log.service';

@Component({
  selector: 'ngx-password-editor',
  templateUrl: './password-editor.component.html',
  styleUrls: ['./password-editor.component.scss']
})
export class PasswordEditorComponent
extends EditorCampo
implements ICampoEditable, OnInit, OnDestroy {
  @ViewChild('validfield') validfield: any;

  @HostBinding('class.col-lg-4')
  @HostBinding('class.col-md-6')
  @HostBinding('class.col-sm-12') elementoVisible: boolean;

  habilitarClases(oculto: boolean) {
    this.elementoVisible = !oculto;
  }

  isConfirm: boolean = false;
  propConfName: string = '';
  propValidName: string = '';
  match: boolean = false;

  constructor(eventos: EventosInterprocesoService, applog: AppLogService) {
    super(eventos, applog);
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
    this.elementoVisible = true;
    this.hookEscuchaEventos();
    this.isConfirm = (this.propiedad.ControlHTML === 'passconfirm');
    this.propConfName = this.propiedad.Id + 'conf';
    this.propValidName = this.propiedad.Id + 'valid';
  }

}
