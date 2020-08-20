import { AtributoLista } from '../../../../@pika/pika-module';
import { MetadataEditorBase } from './../../../model/metadata-editor-base';
import { EntidadesService } from './../../../services/entidades.service';
import { ICampoEditable } from './../../../model/i-campo-editable';
import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { Propiedad } from '../../../../@pika/pika-module';
import { FormGroup } from '@angular/forms';
import { ValorListaOrdenada } from '../../../../@pika/pika-module';
import { Subject, pipe, Observable, of } from 'rxjs';
import { takeUntil, first, distinctUntilChanged, tap, switchMap, catchError } from 'rxjs/operators';
import { Consulta, FiltroConsulta, Operacion } from '../../../../@pika/pika-module';
import { ConfiguracionEntidad } from '../../../model/configuracion-entidad';
import { Operaciones, Evento } from '../../../../@pika/pika-module';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';


@Component({
  selector: 'ngx-list-editor',
  templateUrl: './list-editor.component.html',
  styleUrls: ['./list-editor.component.scss'],
})
export class ListEditorComponent extends MetadataEditorBase
  implements ICampoEditable, OnInit, OnDestroy {
    @ViewChild('ngSelect')
    ngSelect: MatSelect;

  private readonly destroy$ = new Subject<void>();
  propiedad: Propiedad;
  congiguracion: ConfiguracionEntidad;
  group: FormGroup;
  isUpdate: boolean;

  list: ValorListaOrdenada[];
  selected: any = null;


  ops = [Operacion.OP_EQ];
  isTypeAhead:  boolean  = false;

  elementos: ValorListaOrdenada[] = [];
  elementos$: Observable<ValorListaOrdenada[]>;
  listaLoading: boolean = false;
  selectedItems: ValorListaOrdenada[] = [];
  listInput$ = new Subject<string>();

  @ViewChild('lista') Lista: any;

  constructor(entidades: EntidadesService) {
    super(entidades);
  }
 


  // Escucha por eventos de la transacción
  ListenerEventos(): void {
    this.entidades
      .ObtieneEventos()
      .pipe(takeUntil(this.destroy$))
      .subscribe((r) => {

        if (r && r.Transaccion === this.congiguracion.TransactionId) {
          // Sólo se procesan eventos de otros controles
          if (r.Origen !== this.propiedad.Id) {
            if (this.propiedad.AtributosEvento) {
              this.propiedad.AtributosEvento.forEach((att) => {
                if (att.Entidad === r.Origen && att.Evento === r.Evento) {
                  switch (att.Operacion) {
                    case Operaciones.Actualizar:
                      this.ActualizarLista(r);
                      break;
                  }
                }
              });
            }
          }
        }
      });
  }

  ActualizarLista(evt: Evento) {
    this.EmiteEventoCambio(this.propiedad.Id, '', this.congiguracion.TransactionId);

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
            this.EmiteEventoCambio(this.propiedad.Id, atributo.Default, this.congiguracion.TransactionId);
          }
        }
      }
    });
  }

  onChange(value) {
    this.EmiteEventoCambio(this.propiedad.Id, value, this.congiguracion.TransactionId);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getTypeAhead() {
    this.listInput$.pipe(
        distinctUntilChanged(),
        tap(() => this.listaLoading = true),
        switchMap( term => this.entidades.TypeAhead(this.propiedad.AtributoLista, term)
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
    this.EmiteEventoCambio(this.propiedad.Id, newval, this.congiguracion.TransactionId);
    this.group.get(this.propiedad.Id).patchValue(newval);
  }

 

  ngOnInit(): void {


    this.ListenerEventos();
    let aheadval = '';
    if (this.propiedad.AtributoLista) {
      if (this.isUpdate) {
        this.propiedad.AtributoLista.Default = this.group.get(this.propiedad.Id).value;
         aheadval = this.propiedad.AtributoLista.Default;
      }

      if (this.propiedad.AtributoLista.DatosRemotos) {
          // Los datos e obhtienen desde el servidor

          const tieneEventos = this.propiedad.AtributosEvento  &&
          (this.propiedad.AtributosEvento.length  > 0);

          if ( this.propiedad.AtributoLista.TypeAhead || tieneEventos) {

            if (aheadval) {
              this.entidades.ValoresLista([aheadval ],
              this.propiedad.AtributoLista.Entidad ).subscribe( items => {
                this.elementos = items;
                this.ngSelect.toggle();
              });
            }

            // Los dato se obtienen medainete TypeAhead
            this.isTypeAhead = true;
            this.getTypeAhead();

          } else {
            // Los datos se obtienen em una sola llamada
            this.ObtieneLista(this.propiedad.AtributoLista,
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
 
}

  private TieneEventos(): boolean {
    let eventos = false;
    if (this.propiedad.AtributosEvento) {
      if (this.propiedad.AtributosEvento.length > 0) {
        eventos = true;
      }
    }
    return eventos;
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
