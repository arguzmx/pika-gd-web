import { TranslateService } from '@ngx-translate/core';
import { PikaTableComponent } from './pika-table/pika-table.component';
import { Component, OnInit, OnDestroy, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { EditorService } from './services/editor-service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SesionQuery } from '../../@pika/state/sesion.query';
import { DateTimeAdapter } from 'ng-pick-datetime';
import { PikaFormSearchComponent } from './pika-form-search/pika-form-search.component';
import { PikaFormEditComponent } from './pika-form-edit/pika-form-edit.component';
import { AppLogService } from '../../@pika/servicios/app-log/app-log.service';
import { ComponenteBase } from '../../@core/comunes/componente-base';
import { TarjetaVisible, FILTRO_TARJETA_EDITAR, VerboTarjeta, FILTRO_TARJETA_BUSCAR } from './model/tarjeta-visible';


@Component({
  selector: 'ngx-pika-editor',
  templateUrl: './pika-editor.component.html',
  styleUrls: ['./pika-editor.component.scss'],
  providers: [EditorService],
})
export class PikaEditorComponent extends ComponenteBase implements OnInit, OnDestroy, AfterViewInit  {

  @ViewChildren(PikaTableComponent) tablas: QueryList<PikaTableComponent>;
  @ViewChildren(PikaFormSearchComponent) search: QueryList<PikaFormSearchComponent>;
  @ViewChildren(PikaFormEditComponent) editor: QueryList<PikaFormEditComponent>;


  private onDestroy$: Subject<void> = new Subject<void>();
  vistaAlterna: boolean = false;
  tarjetaTrasera: TarjetaVisible = null;
  contenidoTarjetaTrasera: string = '';
  editarActivo: boolean = false;

    constructor(
      translate: TranslateService,
      appLog: AppLogService,
      private editorService: EditorService,
      private sesion: SesionQuery,
      private dateTimeAdapter: DateTimeAdapter<any>,
      ) {
      super(appLog, translate);
      this.ts = ['ui.actualizar', 'ui.crear', 'ui.buscar', 'ui.selcol',
      'ui.borrarfiltros', 'ui.cerrar', 'ui.guardar', 'ui.editar', 'ui.eliminar'];
    }

  ngAfterViewInit(): void {

  }

      borrarFiltros(): void {
        this.search.first.eliminarFiltros();
      }

  refrescarTabla(): void {
    this.tablas.first.refrescarTabla(true);
  }


  mostrariSelColumna(): void {
    this.tablas.first.MOstrarColumnas();
  }

  mostrarBusqueda(): void {
     this.editorService.EstableceTarjetaTraseraVisible( { Visible: true, FiltroUI: FILTRO_TARJETA_BUSCAR , Nombre: ''
     , Verbo: VerboTarjeta.buscar, Payload: null } );
  }


  mostrarCrear(): void {
    this.editorService.EstableceTarjetaTraseraVisible( { Visible: true,
      FiltroUI: FILTRO_TARJETA_EDITAR , Nombre: ''
    , Verbo: VerboTarjeta.adicionar, Payload: null } );
    this.editorService.EditarEntidad(null);
  }

  mostrarEditar(): void {
    this.tablas.first.EditarEntidadSeleccionada();
  }

  ocultarVistaTrasera() {
    this.editorService.EstableceTarjetaTraseraVisible(null);
  }

  mostrarEliminar(): void {
    this.tablas.first.EliminarEntidades();
  }

  ngOnInit(): void {
    this.FiltrosListosListener();
    this.SetLocaleListeter();
    this.ObtenerTraducciones();
    this.ObtieneTarjetaTraseraVisible();
    this.ObtieneEntidadSeleccionada();
  }

  ObtieneEntidadSeleccionada(): void {
    this.editorService.ObtieneEntidadSeleccionada()
    .pipe(takeUntil(this.onDestroy$))
    .subscribe( r => {
      if (r) {
        this.editarActivo = true;
      } else {
        this.editarActivo = false;
      }
    });
  }

  ObtieneTarjetaTraseraVisible(): void {
    this.editorService.ObtieneTarjetaTraseraVisible()
    .pipe(takeUntil(this.onDestroy$))
    .subscribe( r => {
      this.tarjetaTrasera = r;
      if (r) {
        this.vistaAlterna = r.Visible;
        this.contenidoTarjetaTrasera = r.FiltroUI;
      } else {
        this.vistaAlterna = false;
        this.contenidoTarjetaTrasera = '';
      }
    });
  }

  SetLocaleListeter() {
    this.sesion.uilocale$.subscribe( l => {
      this.dateTimeAdapter.setLocale(l);
    });
  }

  // Ontiene la validación apra los filtros añadidos
  // y obtiene una nueva pa´gina si los fisltros son válidos
  FiltrosListosListener(): void {
    this.editorService
      .ObtieneFiltrosValidos()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((validos) => {
        if (validos) {
            this.vistaAlterna = false;
        }
      });
  }



  ngOnDestroy(): void {
    this.onDestroy$.next();
  }


}
