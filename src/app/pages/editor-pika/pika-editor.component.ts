import { TranslateService } from '@ngx-translate/core';
import { PikaTableComponent } from './pika-table/pika-table.component';
import { Component, OnInit, OnDestroy, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { EditorService } from './services/editor-service';
import { Subject } from 'rxjs';
import { takeUntil, first } from 'rxjs/operators';
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
  tieneVinculos: boolean = false;
  vincularActivo: boolean = false;
  NombreEntidad: string = '';

    constructor(
      translate: TranslateService,
      appLog: AppLogService,
      private editorService: EditorService,
      private sesion: SesionQuery,
      private dateTimeAdapter: DateTimeAdapter<any>,
      ) {
      super(appLog, translate);
      this.ts = ['ui.actualizar', 'ui.crear', 'ui.buscar', 'ui.selcol',
      'ui.borrarfiltros', 'ui.cerrar', 'ui.guardar', 'ui.editar', 'ui.eliminar',
      'ui.propiedades'];
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

  mostrarVinculos(): void {
    this.tablas.first.MostrarLinks();
  }

  ocultarVistaTrasera() {
    this.editorService.EstableceTarjetaTraseraVisible(null);
  }

  mostrarEliminar(): void {
    this.tablas.first.EliminarEntidades();
  }

  ngOnInit(): void {
    this.editorService.InitByRoute();
    this.FiltrosListosListener();
    this.SetLocaleListeter();
    this.ObtenerTraducciones();
    this.ObtieneTarjetaTraseraVisible();
    this.ObtieneEntidadSeleccionada();
    this.ObtieneMetadatosListener();
    this.OtieneReset();
  }


  ResetUI(): void {
    this.vistaAlterna = false;
    this.tarjetaTrasera = null;
    this.contenidoTarjetaTrasera = '';
    this.editarActivo = false;
    this.tieneVinculos = false;
    this.vincularActivo = false;
    this.NombreEntidad = '';
  }

  OtieneReset() {
    this.editorService
    .ObtieneResetUI()
    .pipe(takeUntil(this.onDestroy$))
    .subscribe((reset) => {
      if (reset) {
         this.ResetUI();
      }
    });
  }

  ObtieneMetadatosListener() {
    this.editorService
      .ObtieneMetadatosDisponibles()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((metadatos) => {
        if (metadatos) {
          this.tieneVinculos = (metadatos.EntidadesVinculadas &&
            metadatos.EntidadesVinculadas.length > 0)  ? true : false;

        this.translate
          .get('entidades.' + metadatos.Tipo.toLowerCase())
          .pipe(first())
          .subscribe((res) => {
              this.NombreEntidad = this.ObtienePlural(res);
          });
        }
      });
  }

  ObtieneEntidadSeleccionada(): void {
    this.editorService.ObtieneEntidadSeleccionada()
    .pipe(takeUntil(this.onDestroy$))
    .subscribe( r => {
      this.editarActivo = r ? true : false;
      this.vincularActivo =  this.editarActivo && this.tieneVinculos;
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
    this.editorService.OnDestry();
  }


}
