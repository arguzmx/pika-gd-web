import { EditorCampo } from './../editor-campo';
import { Component, OnInit, ViewChild, OnDestroy, HostBinding } from '@angular/core';
import { ICampoEditable } from '../../../model/i-campo-editable';
import { FormGroup, FormArray, FormControl } from '@angular/forms';
import { ValorListaOrdenada } from '../../../../@pika/pika-module';
import { first } from 'rxjs/operators';
import { Evento } from '../../../../@pika/pika-module';
import { Consulta, FiltroConsulta, Operacion } from '../../../../@pika/pika-module';
import { AtributoLista } from '../../../../@pika/pika-module';
import { EventosInterprocesoService } from '../../../services/eventos-interproceso.service';
import { timer } from 'rxjs';


@Component({
  selector: 'ngx-checkbox-group-editor',
  templateUrl: './checkbox-group-editor.component.html',
  styleUrls: ['./checkbox-group-editor.component.scss'],
})
export class CheckboxGroupEditorComponent
extends EditorCampo
implements ICampoEditable, OnInit, OnDestroy {

  @HostBinding('class.col-lg-4')
  @HostBinding('class.col-md-6')
  @HostBinding('class.col-sm-12') elementoVisible: boolean;

  habilitarClases(oculto: boolean) {
    this.elementoVisible = !oculto;
  }

  private iteracionesTimer
  private timerRefresco;
   
  valgroup: FormGroup;
  valoresOriginales: any[];
  list: ValorListaOrdenada[];
  selected: any = null;

  @ViewChild('lista') Lista: any;

  constructor(eventos: EventosInterprocesoService) {
    super(eventos);
  }


  private eventoCambiarValor(valor: any) {
    if (this.propiedad.EmitirCambiosValor) {
      this.EmiteEventoCambio(this.propiedad.Id, valor, this.transaccionId );
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
    this.eventos.SolicitarLista(atributo, consulta).pipe(first())
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
          this.IniciaTimerRefresco();
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

  private IniciaTimerRefresco() {
    let verificar = false;
    this.iteracionesTimer = 3;
    this.timerRefresco = timer(100, 500).subscribe(t => {

      if(this.group.get(this.propiedad.Id).value) {
        if((typeof this.group.get(this.propiedad.Id).value) === 'string') {
          this.valoresOriginales = this.group.get(this.propiedad.Id).value.split(',');
        }

        if(this.valoresOriginales.length>0) {
          verificar = true;
        }

        const v = this.valgroup.controls['valores'] as FormArray;
        const values = [];
        this.propiedad.ValoresLista.forEach( i => {
          const estado: boolean = ( this.valoresOriginales.indexOf(i.Id) >= 0 ) ? true : false;
          values.push(estado);
        });
        v.setValue(values);
  
        if(verificar) {
          this.DetieneTimerRefresco();
        }
      }

      this.iteracionesTimer -=1;
      if (this.iteracionesTimer == 0){
        this.DetieneTimerRefresco();
      }
    });
  }

  private DetieneTimerRefresco() {
    this.timerRefresco.unsubscribe();
  }


  ngOnInit(): void {
    this.elementoVisible = true;
    this.hookEscuchaEventos();
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
   
    const item = this.list.find(x => x.Id === id);
    if (item) {
      if (e) {
        if (this.valoresOriginales.indexOf(item.Id) < 0) this.valoresOriginales.push(item.Id);
      } else {
        const index = this.valoresOriginales.indexOf(item.Id);
        if ( index >= 0) this.valoresOriginales.splice(index, 1);
      }
    }
    this.group.get(this.propiedad.Id).setValue(this.valoresOriginales);
    this.eventoCambiarValor(this.valoresOriginales);
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
