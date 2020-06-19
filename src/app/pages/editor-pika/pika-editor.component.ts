import { TipoNotifiacion } from './model/notificacion';
import { PikaTableComponent } from './pika-table/pika-table.component';
import { Component, OnInit, OnDestroy, ViewChild, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { EditorService } from './services/editor-service'; 
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SesionQuery } from '../../@pika/state/sesion.query';
import { DateTimeAdapter } from 'ng-pick-datetime';
import { PikaFormSearchComponent } from './pika-form-search/pika-form-search.component';
import { PikaFormEditComponent } from './pika-form-edit/pika-form-edit.component';
import { AppLogService } from '../../@pika/servicios/app-log/app-log.service';


export const enum vista {
  none = 0,
  search = 1,
  add = 2,
  edit = 3,
}

@Component({
  selector: 'ngx-pika-editor',
  templateUrl: './pika-editor.component.html',
  styleUrls: ['./pika-editor.component.scss'],
  providers: [EditorService]
})
export class PikaEditorComponent implements OnInit, OnDestroy, AfterViewInit  {

  @ViewChildren(PikaTableComponent) tablas: QueryList<PikaTableComponent>;
  @ViewChildren(PikaFormSearchComponent) search: QueryList<PikaFormSearchComponent>;
  @ViewChildren(PikaFormEditComponent) editor: QueryList<PikaFormEditComponent>;


  private onDestroy$: Subject<void> = new Subject<void>();
  vistaAlterna: boolean = false;
  tipovista: vista = vista.search;
 
  EsBusueda: boolean = true;
  EsCrear: boolean = false;
  EsEditar: boolean = false;

    constructor(
      private appLog: AppLogService,
      private editorService: EditorService,
      private sesion: SesionQuery,
      private dateTimeAdapter: DateTimeAdapter<any>,
      ) {

      }

  ngAfterViewInit(): void {

  }

      borrarFiltros() {
        this.search.first.eliminarFiltros();
      }

  refrescarTabla() {
    this.tablas.first.refrescarTabla();
  }


  mostrariSelColumna() {
    this.tablas.first.MOstrarColumnas();
  }

  mostrarBusqueda() {
    this.tipovista = vista.search;
    this.EsBusueda = true;
    this.EsCrear = false;
    this.EsEditar = false;
    this.vistaAlterna = true;
  }


  mostrarCrear() {
    this.tipovista = vista.search;
    this.EsBusueda = false;
    this.EsCrear = true;
    this.EsEditar = false;
    this.vistaAlterna = true;
  }


  mostrarEditar() {
    this.tipovista = vista.search;
    this.EsBusueda = false;
    this.EsCrear = true;
    this.EsEditar = false;
    this.vistaAlterna = true;
  }


  ocultarVistaTrasera() {
    this.vistaAlterna = false;
  }

  crearEntidad() {
    this.editor.first.crearEntidad();
  }

  ngOnInit(): void {
    this.FiltrosListosListener();
    this.SetLocaleListeter();
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
