import { Component, OnInit, OnDestroy } from '@angular/core';
import { ICampoBuscable } from '../../../model/i-campo-buscable';
import { BuscadorEntidadesBase } from '../../../model/buscador-entidades-base';
import { ValorListaOrdenada } from '../../../../@pika/pika-module';
import { Operacion, Consulta } from '../../../../@pika/consulta';
import { Observable, Subject, of } from 'rxjs';
import { AppLogService } from '../../../../@pika/pika-module';
import { TranslateService } from '@ngx-translate/core';
import { EntidadesService } from '../../../services/entidades.service';
import { distinctUntilChanged, tap, switchMap, catchError, first } from 'rxjs/operators';
import { AtributoLista } from '../../../../@pika/pika-module';
import { CTL_OP_PREFIX } from '../../../model/constantes';
import { Traductor } from '../../../services/traductor';

@Component({
  selector: 'ngx-list-search',
  templateUrl: './list-search.component.html',
  styleUrls: ['./list-search.component.scss'],
})
export class ListSearchComponent extends BuscadorEntidadesBase implements OnInit, OnDestroy,
ICampoBuscable {

  list: ValorListaOrdenada[];
  ops = [Operacion.OP_EQ];
  isTypeAhead:  boolean  = false;

  elementos$: Observable<ValorListaOrdenada[]>;
  listaLoading: boolean = false;
  selectedItems: ValorListaOrdenada[] = [];
  listInput$ = new Subject<string>();

  public T: Traductor;

  private readonly destroy$ = new Subject<void>();

  constructor(applog: AppLogService, translate: TranslateService,
    entidades: EntidadesService) {
    super(entidades, translate);
    this.T = new Traductor(translate);
    this.T.ts = ['ui.no'];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackByFn(item: ValorListaOrdenada) {
    return item.Id;
  }

  verificaFiltro(): void {
    let valid: boolean = true;
    if (this.filtro.Valor.length === 0) valid = false;
    if (this.filtro.Operador == null) valid = false;
    this.setValorString(null);
    this.setValidIcon(valid);
    this.filtro.Valido = valid;
    if (valid) {
      this.setValorString(this.filtro.Valor[0]);
    }

    this.EstadoFiltro.emit(this.filtro);

  }

  // Otiene la lista de alores disponibles para la entidad
  private ObtieneLista(atributo: AtributoLista, consulta: Consulta) {
    this.entidades.SolicitarLista(atributo, consulta).pipe(first())
    .subscribe( lista => {
      if (lista.Valores && lista.Valores.length > 0) {
        if (this.propiedad.Nombre === lista.PropiedadId) {
          this.propiedad.ValoresLista = lista.Valores;

          if (this.propiedad.OrdenarValoresListaPorNombre) {
            this.list = this.Sort('Texto');
          } else {
            this.list = this.Sort('Indice');
          }

          // Si existe un valor default lo selecciona y emite el evento de cambio
          if (lista.Default) {
            if (this.group.get(this.propiedad.Id)) this.group.get(this.propiedad.Id).patchValue(lista.Default);
          }
        }
      }
    });
  }


  private configuraLista(): void {

    if (this.propiedad.AtributoLista) {
      if (this.propiedad.AtributoLista.DatosRemotos) {
        // Los datos e obhtienen desde el servidor

        const tieneEventos = this.propiedad.AtributosEvento  &&
        (this.propiedad.AtributosEvento.length  > 0);

        if ( this.propiedad.AtributoLista.TypeAhead || tieneEventos) {
          // Los dato se obtienen medainete TypeAhead
          this.isTypeAhead = true;
          this.getTypeAhead();

        } else {
          // Los datos se obtienen em una sola llamada
         this.ObtieneLista(this.propiedad.AtributoLista,
               new Consulta());
        }

      } else {
        this.isTypeAhead = false;
        // Losa Vienen incluidos en el objeto
        if (this.propiedad.OrdenarValoresListaPorNombre) {
          this.list = this.Sort('Texto');
        } else {
          this.list = this.Sort('Indice');
        }
      }
    }
  }

  private getTypeAhead() {
    this.elementos$ = this.listInput$.pipe(
        distinctUntilChanged(),
        tap(() => this.listaLoading = true),
        switchMap( term => this.entidades.TypeAhead(this.propiedad.AtributoLista, term)
        .pipe(
          catchError(() => of([])), // empty list on error
          tap(() => this.listaLoading = false),
        )),
    );
  }

  onTypeaheadChange($event: ValorListaOrdenada[]) {
    if ($event.length > 0) {
      this.setValorString($event[0].Id);
      this.inputChange($event[0].Id);
    }
  }

  ngOnInit(): void {

    this.configuraLista();
    this.T.ObtenerTraducciones();
    this.ObtenerOperadores(this.ops);

    this.filtro.Propiedad = this.propiedad.Id;
    this.filtro.Id = this.propiedad.Id;

    this.opCtlId = CTL_OP_PREFIX + this.propiedad.Id;
    this.negCtlId = CTL_OP_PREFIX + this.propiedad.Id;
    this.ctl1Id = CTL_OP_PREFIX + this.propiedad.Id;
    this.ctl2Id = CTL_OP_PREFIX + this.propiedad.Id;

    this.EstableceFltroDefault();
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
