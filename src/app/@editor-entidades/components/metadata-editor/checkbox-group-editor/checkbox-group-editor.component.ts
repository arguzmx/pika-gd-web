import { EditorCampo } from './../editor-campo';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ICampoEditable } from '../../../model/i-campo-editable';
import { FormGroup, FormArray, FormControl } from '@angular/forms';
import { ValorListaOrdenada } from '../../../../@pika/pika-module';
import { EntidadesService } from '../../../services/entidades.service';
import { first } from 'rxjs/operators';
import { Evento } from '../../../../@pika/pika-module';
import { Consulta, FiltroConsulta, Operacion } from '../../../../@pika/pika-module';
import { AtributoLista } from '../../../../@pika/pika-module';


@Component({
  selector: 'ngx-checkbox-group-editor',
  templateUrl: './checkbox-group-editor.component.html',
  styleUrls: ['./checkbox-group-editor.component.scss'],
})
export class CheckboxGroupEditorComponent
extends EditorCampo
implements ICampoEditable, OnInit, OnDestroy {

  valgroup: FormGroup;
  valoresOriginales: any[];
  list: ValorListaOrdenada[];
  selected: any = null;

  @ViewChild('lista') Lista: any;

  constructor(entidades: EntidadesService) {
    super(entidades);
  }


  private eventoCambiarValor(valor: any) {
    if (this.propiedad.EmitirCambiosValor) {
      this.EmiteEventoCambio(this.propiedad.Id, valor, this.congiguracion.TransactionId );
    }
  }
  ActualizarLista(evt: Evento) {
    this.eventoCambiarValor('');

    const consulta = new Consulta();
    const f = new FiltroConsulta();
    f.Operador = Operacion.OP_EQ;
    f.Propiedad = evt.Origen;
    f.Valor = [ evt.Valor ];
    f.ValorString = evt.Valor;

    this.list = [];
    this.selected = null;

    if (this.Lista) {
      this.Lista.reset();
    }
    consulta.FiltroConsulta.push(f);
    this.ObtieneLista(
      this.propiedad.AtributoLista,
      consulta,
    );
  }

  // Otiene la lista de alores disponibles para la entidad
  private ObtieneLista(atributo: AtributoLista, consulta: Consulta) {
    this.entidades.SolicitarLista(atributo, consulta).pipe(first())
    .subscribe( lst => {
      if (this.isUpdate) {
        atributo.Default = this.group.get(this.propiedad.Id).value;
      }

      if (lst.Valores && lst.Valores.length > 0) {
        if (this.propiedad.Id === lst.PropiedadId) {
          const v = this.valgroup.controls['valores'] as FormArray;
          lst.Valores.forEach( i => {
            const estado: boolean = ( this.valoresOriginales.indexOf(i.Id) >= 0 ) ? true : false;
            v.controls.push(new FormControl(estado));
          });
          this.propiedad.ValoresLista = lst.Valores;

          if (this.propiedad.OrdenarValoresListaPorNombre) {
            this.list = this.Sort('Texto');
          } else {
            this.list = this.Sort('Indice');
          }

        }
      }
    });
  }


  ngOnDestroy(): void {
    this.destroy();
  }

  ngOnInit(): void {
    // this.hookEscuchaEventos();
    this.valoresOriginales = this.group.get(this.propiedad.Id).value;
    this.valgroup = this.group.get(this.propiedad.Id + '-valores') as FormGroup;
    if (this.propiedad.AtributoLista) {
      if (this.isUpdate) {
        this.propiedad.AtributoLista.Default = this.group.get(this.propiedad.Id).value;
      }

      const precargar = true;
      // sólo precarga los datos si no dependen de otra entidad
      if (precargar && this.propiedad.AtributoLista.DatosRemotos) {
        this.ObtieneLista(
          this.propiedad.AtributoLista,
          new Consulta());
      }

    } else {
      if (this.propiedad.OrdenarValoresListaPorNombre) {
        this.list = this.Sort('Texto');
      } else {
        this.list = this.Sort('Indice');
      }
    }
  }

  public change(e: any, id: any) {
    const arr: any[] = this.group.get(this.propiedad.Id).value ;
    const item = this.list.find(x => x.Id === id);
    if (item) {
      if (e) {
        if (arr.indexOf(item.Id) < 0) arr.push(item.Id);
      } else {
        const index = arr.indexOf(item.Id);
        if ( index >= 0) arr.splice(index, 1);
      }
    }
    this.group.get(this.propiedad.Id).setValue(arr);
    this.eventoCambiarValor(arr);
  }

  Sort(by: string) {
    return this.propiedad.ValoresLista.sort((obj1, obj2) => {
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
