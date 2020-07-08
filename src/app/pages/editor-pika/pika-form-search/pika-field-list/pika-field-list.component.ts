import { FiltroConsulta } from './../../../../@pika/consulta/filtro-consulta';
import { TranslateService } from '@ngx-translate/core';
import { Propiedad } from './../../../../@pika/metadata/propiedad';
import { CampoBuscable, CTL_OP_PREFIX, CTL_NEG_PREFIX, CTL1_PREFIX, CTL2_PREFIX } from './../../model/campo';
import { ValorListaOrdenada } from './../../../../@pika/metadata/valor-lista';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SearchFieldBase } from '../search-fields/search-field-base';
import { EditorService } from '../../services/editor-service';
import { Operacion, Consulta } from '../../../../@pika/consulta';
import { AppLogService } from '../../../../@pika/servicios/app-log/app-log.service';
import { Evento } from '../../../../@pika/metadata/atributo-evento';
import { takeUntil, concat, distinctUntilChanged, tap, switchMap, catchError } from 'rxjs/operators';
import { Observable, of, Subject, pipe } from 'rxjs';



@Component({
  selector: 'ngx-pika-field-list',
  templateUrl: './pika-field-list.component.html',
  styleUrls: ['./pika-field-list.component.scss'],
})
export class PikaFieldListComponent extends SearchFieldBase  implements  OnInit, OnDestroy,
CampoBuscable {

  config: Propiedad;
  group: FormGroup;
  list: ValorListaOrdenada[];
  ctl1Id: string;
  ctl2Id: string;
  negCtlId: string;
  opCtlId: string;
  ops = [Operacion.OP_EQ];
  isTypeAhead:  boolean  = false;

  elementos$: Observable<ValorListaOrdenada[]>;
  listaLoading: boolean = false;
  selectedItems: ValorListaOrdenada[] = [];
  listInput$ = new Subject<string>();

  private readonly destroy$ = new Subject<void>();

  constructor(appLog: AppLogService, ts: TranslateService, editorService: EditorService) {
    super(ts, appLog, editorService);
    this.ts = ['ui.no'];
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
    if (valid) {
      this.setValorString(this.filtro.Valor[0]);
      this.editorService.AgregarFiltro(this.filtro);
    } else {
      this.editorService.InvalidarFiltro(this.filtro);
    }

  }

  closeFilter(): void {
    this.editorService.EliminarFiltro(this.config);
  }

  private configuraLista(): void {
    if (this.config.AtributoLista) {
      if (this.config.AtributoLista.DatosRemotos) {
        // Los datos e obhtienen desde el servidor

        const tieneEventos = this.config.AtributosEvento  &&
        (this.config.AtributosEvento.length  > 0);

        if ( this.config.AtributoLista.TypeAhead || tieneEventos) {
          // Los dato se obtienen medainete TypeAhead
          this.isTypeAhead = true;
          this.getTypeAhead();

        } else {
          // Los datos se obtienen em una sola llamada
          this.editorService.SolicitarLista(
            this.config.AtributoLista,
            new Consulta(),
          );
        }

      } else {
        this.isTypeAhead = false;
        // Losa Vienen incluidos en el objeto
        if (this.config.OrdenarValoresListaPorNombre) {
          this.list = this.Sort('Texto');
        } else {
          this.list = this.Sort('Indice');
        }
      }
    }
  }



  ObtieneNuevasListas(): void {
    this.editorService
      .ObtieneNuevasListas()
      .pipe(takeUntil(this.destroy$))
      .subscribe((r) => {
        if (r) {
          if (r.Valores && r.Valores.length > 0) {
            if (this.config.Nombre === r.PropiedadId) {
              this.config.ValoresLista = r.Valores;

              if (this.config.OrdenarValoresListaPorNombre) {
                this.list = this.Sort('Texto');
              } else {
                this.list = this.Sort('Indice');
              }
              // Si existe un valor default lo selecciona y emite el evento de cambio
              if (r.Default) {
                this.group.get(this.ctl1Id).patchValue(r.Default);
              }
            }
          }
        }
      });
  }


  private getTypeAhead() {
    this.elementos$ = this.listInput$.pipe(
        distinctUntilChanged(),
        tap(() => this.listaLoading = true),
        switchMap( term => this.editorService.TypeAhead(this.config.AtributoLista, term)
        .pipe(
          catchError(() => of([])), // empty list on error
          tap(() => this.listaLoading = false),
        )),
    );
  }

  onTypeaheadChange($event: ValorListaOrdenada) {
    this.setValorString($event[0].Id);
    this.inputChange($event[0].Id);
  }

  ngOnInit(): void {
    this.ObtieneNuevasListas();
    this.configuraLista();
    this.ObtenerTraducciones();
    this.ObtenerOperadores(this.ops);

    this.filtro.Propiedad = this.config.Id;
    this.filtro.Id = this.config.Id;

    this.opCtlId = CTL_OP_PREFIX + this.config.Id;
    this.negCtlId = CTL_NEG_PREFIX + this.config.Id;
    this.ctl1Id = CTL1_PREFIX + this.config.Id;
    this.ctl2Id = CTL2_PREFIX + this.config.Id;
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
