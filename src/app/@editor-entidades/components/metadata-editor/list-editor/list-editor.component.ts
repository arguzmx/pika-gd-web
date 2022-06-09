import { EditorCampo } from './../editor-campo';
import { AtributoLista, AtributoEvento, Evento, HTML_SELECT_MULTI } from '../../../../@pika/pika-module';
import { ICampoEditable } from './../../../model/i-campo-editable';
import { Component, OnInit, OnDestroy, ViewChild, OnChanges, SimpleChanges, HostBinding } from '@angular/core';
import { ValorListaOrdenada } from '../../../../@pika/pika-module';
import { Subject, of, timer } from 'rxjs';
import { first, distinctUntilChanged, tap, switchMap, catchError } from 'rxjs/operators';
import { Consulta, FiltroConsulta, Operacion } from '../../../../@pika/pika-module';
import { MatSelect } from '@angular/material/select';
import { EventosInterprocesoService } from '../../../services/eventos-interproceso.service';



@Component({
  selector: 'ngx-list-editor',
  templateUrl: './list-editor.component.html',
  styleUrls: ['./list-editor.component.scss'],
})
export class ListEditorComponent extends EditorCampo
  implements ICampoEditable, OnInit, OnDestroy  {
    @ViewChild('ngSelect')
    ngSelect: MatSelect;
    
    @HostBinding('class.col-lg-4')
    @HostBinding('class.col-md-6')
    @HostBinding('class.col-sm-12') elementoVisible: boolean;
  
    habilitarClases(oculto: boolean) {
      this.elementoVisible = !oculto;
    }

  list: ValorListaOrdenada[];
  selected: any = null;


  ops = [Operacion.OP_EQ];
  isTypeAhead:  boolean  = false;

  elementos: ValorListaOrdenada[] = [];
  listaLoading: boolean = false;
  selectedItems: ValorListaOrdenada[] = [];
  listInput$ = new Subject<string>();

  @ViewChild('lista') Lista: any;
    
  constructor(eventos: EventosInterprocesoService) {
    super(eventos);
  }

  private GetFiltrosPropiedad(): FiltroConsulta[] {
    const filtros = this.filtrosQ.find(x=>x.PropiedadId == this.propiedad.Id);
    const r = [];
    if (filtros) {
      filtros.Filtros.forEach(fq=> {
        r.push(fq);
      });
    }
    return r;
  }

  private eventoCambiarValor(valor: any) {
    if (this.propiedad.EmitirCambiosValor) {
      this.EmiteEventoCambio(this.propiedad.Id, valor, this.transaccionId );
    }
  }

  eventoActualizar(ev: Evento, a: AtributoEvento) {
    this.eventoCambiarValor('');
    const consulta = new Consulta();
    const f = new FiltroConsulta();
    f.Operador = Operacion.OP_EQ;
    f.Propiedad = ev.Origen;
    f.Valor = [ ev.Valor ];
    f.ValorString = ev.Valor;

    this.list = [];
    this.selected = null;
    if (this.isTypeAhead) {
      this.elementos = [];
    } else {
      if (this.Lista) {
        this.Lista.reset();
      }
      
      const filtros = this.GetFiltrosPropiedad();
      if (filtros) {
        filtros.forEach(fq=> {
          consulta.FiltroConsulta.push(fq);
        });
      }
      
      consulta.FiltroConsulta.push(f);
      this.ObtieneLista(
        this.propiedad.AtributoLista,
        consulta,
      );
    }
  }


  // Otiene la lista de alores disponibles para la entidad
  private ObtieneLista(atributo: AtributoLista, consulta: Consulta) {
    this.eventos.SolicitarLista(atributo, consulta).pipe(first())
    .subscribe( lst => {
      if (this.isUpdate) {
        atributo.Default = this.group.get(this.propiedad.Id).value;
      }

      if (lst.Valores && lst.Valores.length > 0) {
        if (this.propiedad.Id.toLowerCase() === lst.PropiedadId.toLowerCase()) {
          this.propiedad.ValoresLista = lst.Valores;

          if (this.propiedad.OrdenarValoresListaPorNombre) {
            this.list = this.Sort('Texto');
          } else {
            this.list = this.Sort('Indice');
          }

          // Si existe un valor default lo selecciona y emite el evento de cambio
          if (atributo.Default) {
            this.group.get(this.propiedad.Id).patchValue(atributo.Default);
            this.selected = atributo.Default;
            // this.eventoCambiarValor(atributo.Default);
          }
        }
      }
    });
  }

  onChange(value) {
    this.eventoCambiarValor(value);
  }

  ngOnDestroy(): void {
   this.destroy();
  }

  private getTypeAhead() {
    this.listInput$
    .pipe(
        distinctUntilChanged(),
        tap(() => {
          this.listaLoading = true;
          // console.log(this.filtrosQ);
        }),
        switchMap( term => this.eventos.TypeAhead(this.propiedad.AtributoLista, term, this.GetFiltrosPropiedad())
        .pipe(
          catchError(() => of([])), // empty list on error
          tap(() => this.listaLoading = false),
        )),
    ).subscribe( items => {
      this.elementos = items;
    }) ;
  }

  onTypeaheadChange($event: ValorListaOrdenada) {
    const newval = $event ? $event.Id : null;
    this.eventoCambiarValor(newval);
    this.group.get(this.propiedad.Id).patchValue(newval);
  }

  private iteracionesTimer
  private timerRefresco;

  private IniciaTimerRefresco() {
    let verificar = false;
    this.iteracionesTimer = 3;
    this.timerRefresco = timer(100, 500).subscribe(t => {
      let aheadval = '';
      if(this.group.get(this.propiedad.Id).value) {
        this.propiedad.AtributoLista.Default = this.group.get(this.propiedad.Id).value;
        aheadval = this.propiedad.AtributoLista.Default;
        if (this.isUpdate && aheadval) {
          this.eventos.ValoresLista([aheadval ],
          this.propiedad.AtributoLista.Entidad ).subscribe( items => {
            this.elementos = items;
            if(this.ngSelect) {
              this.ngSelect.toggle();
            }
          });
        }
        verificar = true;
      }

      this.iteracionesTimer -=1;
      if (verificar || this.iteracionesTimer == 0){
        this.DetieneTimerRefresco();
      }
    });
  }

  private DetieneTimerRefresco() {
    this.timerRefresco.unsubscribe();
  }

  ngOnInit(): void {
    // console.log(this.filtrosQ);
    // console.log(this.propiedad);
    this.elementoVisible = true;
    this.hookEscuchaEventos();
    let aheadval = '';
    // console.log(this.propiedad);
    // console.log(this.isUpdate);
    // console.log(this.propiedad.AtributoLista);
    // console.log(this.group);
    if (this.propiedad.AtributoLista) {
      if (this.isUpdate) {
        this.IniciaTimerRefresco();
        this.propiedad.AtributoLista.Default = this.group.get(this.propiedad.Id).value;
        aheadval = this.propiedad.AtributoLista.Default;
      }

      if (this.propiedad.AtributoLista.DatosRemotos) {
          // Los datos e obhtienen desde el servidor
          const tieneEventos = this.propiedad.AtributosEvento  &&
          (this.propiedad.AtributosEvento.length  > 0);

          if (this.propiedad.AtributoLista.TypeAhead) {
            this.isTypeAhead = true;
            // Los dato se obtienen medainete TypeAhead
            this.getTypeAhead();

            // Carga la lista de valores si es un update
            // if (this.isUpdate && aheadval) {
            //   // console.log(this.eventos.ValoresLista);
            //   // console.log(aheadval);
            //   this.eventos.ValoresLista([aheadval ],
            //   this.propiedad.AtributoLista.Entidad ).subscribe( items => {
            //     this.elementos = items;
            //     this.ngSelect.toggle();
            //   });
            // }
          }

          if ( (!tieneEventos && !this.isTypeAhead) ||  (this.propiedad.AtributoLista.EsListaTemas) ) {
            // Los datos se obtienen em una sola llamada cuando no 
            // dependen de un evento y no es typeahead
            const consulta = new Consulta();
            if(this.filtrosQ) {
              this.filtrosQ.forEach(ff=>{
                if(true) {
                  ff.Filtros.forEach(f=>{
                    consulta.FiltroConsulta.push({Negacion: f.Negacion,Propiedad: f.Propiedad, Operador: f.Operador, Valor: [f.Valor], ValorString: f.ValorString, Valido: true});
                  })
                }
              })
            }
            this.ObtieneLista(this.propiedad.AtributoLista, consulta );
          }

      } else {
        if(Boolean(this.propiedad.AtributoLista.ValoresCSV) === false) {
          this.propiedad.ValoresLista = this.propiedad.AtributoLista.Valores;
        }

        if (this.propiedad.AtributoLista.OrdenarAlfabetico) {
          this.list = this.Sort('Texto');
        } else {
          this.list = this.Sort('Indice');
        }
      }

    }
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

  trackByFn(item: ValorListaOrdenada) {
    if (item) return item.Id;
    return '';
  }

}
