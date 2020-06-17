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
  Inject,
} from '@angular/core';
import { Config, Columns, DefaultConfig, APIDefinition } from 'ngx-easy-table';
import { NbDialogService, NbToastrService, NbIconConfig } from '@nebular/theme';
import { ColumnaTabla, TablaEventObject } from '../services/pika-editor-service';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import PikaEditorBase from '../editor-base';
import { Consulta } from '../../../@pika/consulta';
import { environment } from '../../../../environments/environment';
import { FormSearchService } from '../pika-form-search/form-search-service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


@Component({
  selector: 'ngx-pika-table',
  templateUrl: './pika-table.component.html',
  styleUrls: ['./pika-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PikaTableComponent extends PikaEditorBase implements OnInit, OnDestroy {
  @ViewChild('table', { static: true }) table: APIDefinition;
  @ViewChild('boolTpl', { static: true }) boolTpl: TemplateRef<any>;
  @ViewChild('dialogColPicker', { static: true }) dialogColPicker: TemplateRef<any>;

  private onDestroy$: Subject<void> = new Subject<void>();

  private iconConfigWarning: NbIconConfig = { icon: 'alert-triangle-outline', pack: 'eva' };
  public configuration: Config;
  public data: any;
  public columns: Columns[] = [];
  public columnasBase: ColumnaTabla[] = [];
  private tmpcolumnas: ColumnaTabla[] = [];
  private filtros: FiltroConsulta[] = [];

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
    private toastrService: NbToastrService,
    private searchService: FormSearchService,
    route: ActivatedRoute,
    http: HttpClient,
  ) {

      super(route,  http);


  }


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
    this.GetData(this.consulta);
  }

  // Obiene una página de datos desde el servidor
  private GetData(consulta: Consulta) {
    this.configuration.isLoading = true;
    this.eService.GetData(consulta).subscribe(
        (response) => {
          this.data = response.Elementos;
          this.cdr.markForCheck();
          this.pagination.count = response.ConteoTotal;
          this.pagination = { ...this.pagination };
          this.configuration.isLoading = false;
        },
        (error) => {
          this.toastrService.info('Error obtener página de datos');
        }, () => {
          this.configuration.isLoading = false;
        },
      );
  }

  // Mustra el selector de columnas
  public MOstrarColumnas(): void {
    this.tmpcolumnas = this.columnasBase.map(obj => ({...obj}));
       this.dialogService.open(
       this.dialogColPicker,
       { context: '' }).onClose.subscribe(() => {
        this.CheckColumnasSeleccionadas();
       });
  }


private CheckColumnasSeleccionadas() {
  if (this.tmpcolumnas.filter(x => x.Visible === true).length === 0) {
    this.toastrService.show('Debe tener al menos una columna visible', 'Advertencia',  this.iconConfigWarning);
    this.MOstrarColumnas();
  } else {
    this.columnasBase = this.tmpcolumnas.map(obj => ({...obj}));
    this.EstableceColumnas(this.columnasBase);
  }
}

  public AlternarColumna(id: any, checked: boolean): void {
    const updateItem =  this.tmpcolumnas.filter(x => x.Id === id)[0];
    const  index = this.tmpcolumnas.indexOf(updateItem);
    updateItem .Visible = checked;
    this.tmpcolumnas[index] = updateItem ;
  }


  public refrescarTabla(): void {
    this.GetData(this.consulta);
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
    this.pagination.limit = obj.value.limit ? obj.value.limit : this.pagination.limit;
    this.pagination.offset = obj.value.page ? obj.value.page : this.pagination.offset;
    this.pagination.sort = !!obj.value.key ? obj.value.key : this.pagination.sort;
    this.pagination.order = !!obj.value.order ? obj.value.order : this.pagination.order;
    this.pagination = { ...this.pagination };
    this.consulta.consecutivo = 0;
    this.consulta.indice = this.pagination.offset - 1;
    this.consulta.tamano = this.pagination.limit;
    this.consulta.ord_columna = this.pagination.sort;
    this.consulta.ord_direccion = this.pagination.order;
    this.consulta = { ...this.consulta };
    this.GetData(this.consulta);
  }

  // inicializa la tabla para la UI
  InicializaTabla(): void {
    this.eService.ObtieneMetadatos.subscribe( (valid) => {
      if ( valid ) {
        this.columnasBase = this.eService.GetColumnasTabla();
        this.EstableceColumnas(this.columnasBase);
      } else {
        this.toastrService.info('Error obtener metadaatos');
      }
    }, (error) => {
      this.toastrService.info('Error obtener metadaatos');
    } );
  }

  ngOnInit(): void {
    this.ConfiguraTabla();
    this.inicializaCliente();
    this.FiltrosListener();
    this.FiltrosListosListener();
  }

  FiltrosListosListener(): void {
    this.searchService.ObtieneFiltrosValidos()
    .pipe(takeUntil(this.onDestroy$))
    .subscribe( validos => {
      if (validos) {
          console.log(this.filtros);
      }
    });
  }

  FiltrosListener(): void {
    this.searchService.ObtieneFiltros()
    .pipe(takeUntil(this.onDestroy$))
    .subscribe( filtros => {
      this.filtros = filtros;
    });
  }


  inicializaCliente(): void {
    this.route.queryParams.subscribe(
      (params) => {
        if (params[environment.editorToken]) {
          this.entidad = params[environment.editorToken];
        }

        if (this.entidad !== '') {
          this.CreaCliente();
          this.InicializaTabla();
        } else {
          this.toastrService.info('Error obtener entidad');
        }
      },
      (error) => {
        this.toastrService.info('Error obtener entidad');
      },
    );
  }

  ///  Inicializa las opciones para la tabla
  ConfiguraTabla(): void {
    this.configuration = { ...DefaultConfig };
    this.configuration.isLoading = true;
    this.configuration.serverPagination = true;
    this.configuration.threeWaySort = false;
    // this.configuration.horizontalScroll = true;
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
  }

}
