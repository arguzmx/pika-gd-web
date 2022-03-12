import { Component, OnInit, OnDestroy } from '@angular/core';
import { ICampoBuscable } from '../../../model/i-campo-buscable';
import { BuscadorEntidadesBase } from '../../../model/buscador-entidades-base';
import { ValorListaOrdenada } from '../../../../@pika/pika-module';
import { Operacion, Consulta } from '../../../../@pika/consulta';
import { Observable, Subject, of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { distinctUntilChanged, tap, switchMap, catchError, first } from 'rxjs/operators';
import { AtributoLista } from '../../../../@pika/pika-module';
import { CTL_OP_PREFIX } from '../../../model/constantes';
import { Traductor } from '../../../services/traductor';
import { CacheFiltrosBusqueda } from '../../../services/cache-filtros-busqueda';
import { ServicioListaMetadatos } from '../../../services/servicio-lista-metadatos';
import { NB_THEME_OPTIONS } from '@nebular/theme';
import { isThursday } from 'date-fns';
import { AppLogService } from '../../../../services/app-log/app-log.service';

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
  listaEnpoint: string = null;
  elementos$: Observable<ValorListaOrdenada[]>;
  listaLoading: boolean = false;
  selectedItems: ValorListaOrdenada[] = [];
  listInput$ = new Subject<string>();

  public T: Traductor;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private servicioListas: ServicioListaMetadatos, 
    applog: AppLogService, 
    translate: TranslateService,
    cache: CacheFiltrosBusqueda) {
    super(cache, translate);
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
    this.servicioListas.SolicitarLista(atributo, consulta, this.listaEnpoint).pipe(first())
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

        if(this.propiedad.AtributoLista.Endpoint) {
          this.listaEnpoint = this.propiedad.AtributoLista.Endpoint;
        }

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
        // Añade los valores del CSV en el caso de que existan
        if (this.propiedad.AtributoLista.ValoresCSV) {
          let indice: number = 0;
          this.propiedad.AtributoLista.ValoresCSV.split(',').forEach( v => {
            this.propiedad.ValoresLista.push({Id: v, Texto: v, Indice: indice});
            indice ++;
          });
          this.propiedad.OrdenarValoresListaPorNombre = false;
        }

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
        switchMap( term => this.servicioListas.TypeAhead(this.propiedad.AtributoLista, term, this.listaEnpoint)
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

    if(this.propiedad)

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
