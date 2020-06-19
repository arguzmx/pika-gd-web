import { AppLogService } from './../../../@pika/servicios/app-log/app-log.service';
import { FiltroConsulta } from './../../../@pika/consulta/filtro-consulta';
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  OnDestroy,
  ViewChild,
  ChangeDetectionStrategy,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core';
import { Config, Columns, DefaultConfig, APIDefinition } from 'ngx-easy-table';
import { NbDialogService, NbToastrService, NbIconConfig } from '@nebular/theme';
import { Consulta } from '../../../@pika/consulta';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EditorService } from '../services/editor-service';
import { ColumnaTabla } from '../model/columna-tabla';
import { TablaEventObject } from '../model/tabla-event-object';

@Component({
  selector: 'ngx-pika-table',
  templateUrl: './pika-table.component.html',
  styleUrls: ['./pika-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PikaTableComponent implements OnInit, OnDestroy {
  @ViewChild('table', { static: true }) table: APIDefinition;
  @ViewChild('boolTpl', { static: true }) boolTpl: TemplateRef<any>;
  @ViewChild('dialogColPicker', { static: true }) dialogColPicker: TemplateRef<
    any
  >;

  private onDestroy$: Subject<void> = new Subject<void>();

  private iconConfigWarning: NbIconConfig = {
    icon: 'alert-triangle-outline',
    pack: 'eva',
  };
  public configuration: Config;
  public data: any;
  public columns: Columns[] = [];
  public columnasBase: ColumnaTabla[] = [];
  private tmpcolumnas: ColumnaTabla[] = [];
  private filtros: FiltroConsulta[] = [];
  private notificar: boolean = false;

  public pagination = {
    limit: 10,
    offset: 0,
    count: -1,
    sort: '',
    order: '',
  };

  public consulta: Consulta = {
    indice: 0,
    tamano: 10,
    ord_columna: '',
    ord_direccion: '',
    recalcular_totales: true,
    consecutivo: 0,
    FiltroConsulta: [],
  };

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private dialogService: NbDialogService,
    private appLog: AppLogService,
    private editorService: EditorService,
  ) {}

  // establece la configuración de las columnas de la tabla  a partir de los metadatos recibidos
  private EstableceColumnas(columnas: ColumnaTabla[]): void {
    this.columns = [];
    for (let i = 0; i < columnas.length; i++) {
      if (columnas[i].Visible)
        this.columns.push({
          key: columnas[i].Id,
          title: columnas[i].Nombre,
          orderEnabled: columnas[i].Ordenable,
          searchEnabled: columnas[i].Buscable,
          cellTemplate: columnas[i].Tipo === 'bool' ? this.boolTpl : null,
        });
    }
    this.editorService.NuevaConsulta(this.consulta);
  }

  // Mustra el selector de columnas
  public MOstrarColumnas(): void {
    this.tmpcolumnas = this.columnasBase.map((obj) => ({ ...obj }));
    this.dialogService
      .open(this.dialogColPicker, { context: '' })
      .onClose.subscribe(() => {
        this.CheckColumnasSeleccionadas();
      });
  }

  private CheckColumnasSeleccionadas() {
    if (this.tmpcolumnas.filter((x) => x.Visible === true).length === 0) {
      this.appLog.Advertencia('', 'Debe tener al menos una columna visible');
      this.MOstrarColumnas();
    } else {
      this.columnasBase = this.tmpcolumnas.map((obj) => ({ ...obj }));
      this.EstableceColumnas(this.columnasBase);
    }
  }

  public AlternarColumna(id: any, checked: boolean): void {
    const updateItem = this.tmpcolumnas.filter((x) => x.Id === id)[0];
    const index = this.tmpcolumnas.indexOf(updateItem);
    updateItem.Visible = checked;
    this.tmpcolumnas[index] = updateItem;
  }

  public refrescarTabla(): void {
    this.editorService.NuevaConsulta(this.consulta);
  }

  // Captura los eventos del grid
  eventEmitted($event: { event: string; value: any }): void {
    switch ($event.event) {
      case 'onOrder':
      case 'onPagination':
        this.onPagination($event);
        break;
    }
  }

  // evalua el evento de paginacdo
  private onPagination(obj: TablaEventObject): void {
    this.pagination.limit = obj.value.limit
      ? obj.value.limit
      : this.pagination.limit;
    this.pagination.offset = obj.value.page
      ? obj.value.page
      : this.pagination.offset;
    this.pagination.sort = !!obj.value.key
      ? obj.value.key
      : this.pagination.sort;
    this.pagination.order = !!obj.value.order
      ? obj.value.order
      : this.pagination.order;
    this.pagination = { ...this.pagination };
    this.consulta.consecutivo = 0;
    this.consulta.indice = this.pagination.offset - 1;
    this.consulta.tamano = this.pagination.limit;
    this.consulta.ord_columna = this.pagination.sort;
    this.consulta.ord_direccion = this.pagination.order;
    this.consulta = { ...this.consulta };
    this.editorService.NuevaConsulta(this.consulta);
  }

  ngOnInit(): void {
    this.ConfiguraTabla();
    this.FiltrosListener();
    this.FiltrosListosListener();
    this.ObtieneMetadatosListener();
    this.ObtienePaginaListener();
  }

  ObtienePaginaListener() {
    this.editorService.ObtieneNuevaPaginaisponible()
    .pipe(takeUntil(this.onDestroy$))
    .subscribe(
      (response) => {
        if (response) {
          this.data = response.Elementos;
          this.cdr.markForCheck();
          this.pagination.count = response.ConteoTotal;
          this.pagination = { ...this.pagination };
          this.configuration.isLoading = false;
          if (this.notificar) this.appLog.Exito('',
          `${response.ConteoTotal} elementos encontrados`);
          this.notificar = false;
        }
      },
      (error) => {
        this.appLog.Falla('', 'Error obtener página de datos');
      },
      () => {
        this.configuration.isLoading = false;
      });
  }

  ObtieneMetadatosListener() {
    this.editorService
      .ObtieneMetadatosDisponibles()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((validos) => {
        if (validos) {
          this.columnasBase = this.editorService.GetColumnasTabla();
          this.EstableceColumnas(this.columnasBase);
          this.refrescarTabla();
        }
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
          this.consulta.FiltroConsulta = this.filtros;
          this.editorService.NuevaConsulta(this.consulta);
          this.notificar = true;
        }
      });
  }

  // Obtiene cambios a los filtros
  FiltrosListener(): void {
    this.editorService
      .ObtieneFiltros()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((filtros) => {
        this.filtros = filtros;
        if ( this.filtros.length === 0){
          this.consulta.FiltroConsulta = this.filtros;
          // this.editorService.NuevaConsulta(this.consulta);
        }
      });
  }

  ///  Inicializa las opciones para la tabla
  ConfiguraTabla(): void {
    this.configuration = { ...DefaultConfig };
    this.configuration.isLoading = true;
    this.configuration.serverPagination = true;
    this.configuration.threeWaySort = false;
    this.configuration.tableLayout.style = 'normal';
    this.configuration.tableLayout.striped = true;
    this.configuration.tableLayout.borderless = false;
    // this.configuration.horizontalScroll = true;
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
  }
}
