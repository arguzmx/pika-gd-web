import { Propiedad } from './../../../@pika/metadata/propiedad';
import { ValidadorTexto } from './../../../@pika/metadata/validador-texto';
import { TranslateService } from '@ngx-translate/core';
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
import { NbDialogService, NbIconConfig } from '@nebular/theme';
import { Consulta, Operacion } from '../../../@pika/consulta';
import { Subject } from 'rxjs';
import { takeUntil, first } from 'rxjs/operators';
import { EditorService } from '../services/editor-service';
import { ColumnaTabla } from '../model/columna-tabla';
import { TablaEventObject } from '../model/tabla-event-object';
import { ComponenteBase } from '../../../@core/comunes/componente-base';
import { FILTRO_TARJETA_EDITAR, VerboTarjeta } from '../model/tarjeta-visible';
import { RouteReuseStrategy } from '@angular/router';

@Component({
  selector: 'ngx-pika-table',
  templateUrl: './pika-table.component.html',
  styleUrls: ['./pika-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PikaTableComponent extends ComponenteBase implements OnInit, OnDestroy {
  @ViewChild('table', { static: true }) table: APIDefinition;
  @ViewChild('boolTpl', { static: true }) boolTpl: TemplateRef<any>;
  @ViewChild('dialogColPicker', { static: true }) dialogColPicker: TemplateRef<any>;
  @ViewChild('dialogConfirmDelete', { static: true }) dialogConfirmDelete: TemplateRef<any>;

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
  private entidadSeleccionada: any = null;
  public eliminarLogico: boolean = false;
  private dialogComnfirmDelRef: any;

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
    translator: TranslateService,
    appLog: AppLogService,
    private readonly cdr: ChangeDetectorRef,
    private dialogService: NbDialogService,
    private editorService: EditorService,
  ) {
    super(appLog, translator);
    this.ts = ['ui.cerrar', 'ui.selcol', 'ui.eliminar', 'ui.confirmar'];
  }

  // establece la configuración de las columnas de la tabla  a partir de los metadatos recibidos
  private EstableceColumnas(columnas: ColumnaTabla[]): void {
    this.columns = [];
    for (let i = 0; i < columnas.length; i++) {
      if (columnas[i].Visible)
        this.columns.push({
          key: columnas[i].Id,
          title: columnas[i].NombreI18n,
          orderEnabled: columnas[i].Ordenable,
          searchEnabled: columnas[i].Buscable,
          cellTemplate: columnas[i].Tipo === 'bool' ? this.boolTpl : null,
        });
    }

    this.refrescarTabla(true);
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
      this.appLog.AdvertenciaT('editor-pika.mensajes.warn-sin-columnas');
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

  public refrescarTabla(notificar: boolean): void {
    if (this.columns.length > 4) {
      this.configuration.horizontalScroll = true;
     } else {
      this.configuration.horizontalScroll = false;
     }
    this.notificar = notificar;
    this.editorService.NuevaConsulta(this.consulta);
  }

  // Captura los eventos del grid
  eventEmitted($event: { event: string; value: any }): void {

    switch ($event.event) {
      case 'onOrder':
      case 'onPagination':
        this.onPagination($event);
        this.entidadSeleccionada = null;
        break;

      case 'onClick':
        this.entidadSeleccionada = $event.value.row;
        break;

      case 'onDoubleClick':
        this.entidadSeleccionada = $event.value.row;
        this.EditarEntidadSeleccionada();
        break;
    }

    this.editorService.EntidadSeleccionada(this.entidadSeleccionada);
  }

  EditarEntidadSeleccionada(): void {
    if (this.entidadSeleccionada) {
      this.editorService.EstableceTarjetaTraseraVisible( { Visible: true,
        FiltroUI: FILTRO_TARJETA_EDITAR ,  Nombre: '',
        Verbo: VerboTarjeta.editar, Payload: this.entidadSeleccionada } );
      this.editorService.EditarEntidad(this.entidadSeleccionada);
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
    this.refrescarTabla(false);
  }

  ngOnInit(): void {
    this.ConfiguraTabla();
    this.FiltrosListener();
    this.FiltrosListosListener();
    this.ObtieneMetadatosListener();
    this.ObtienePaginaListener();
    this.ObtenerTraducciones();
    this.ObtieneResultadoAPI();
  }

  ObtieneResultadoAPI(): void {
    this.editorService.ObtieneResultadoAPI()
    .pipe(takeUntil(this.onDestroy$))
    .subscribe(
      (response) => {
        if (response) {
          if (response.ok) {
            this.entidadSeleccionada = null;
            this.editorService.EntidadSeleccionada(this.entidadSeleccionada);
            this.refrescarTabla(false);
          }
        }
    });
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
          if (this.notificar) this.appLog.ExitoT('editor-pika.mensajes.ok-pagina-datos', null,
          {cantidad: response.ConteoTotal});
          this.notificar = false;
        }
      },
      (error) => {
        this.appLog.FallaT('editor-pika.mensajes.err-pagina-datos', null , { error: error});
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

          this.eliminarLogico  = (validos.ElminarLogico === true) ? true : false;

          if (this.eliminarLogico) {
            this.filtros.push(this.FiltroEliminadas());
          }

          this.consulta.FiltroConsulta = this.filtros;
          this.columnasBase = this.GetColumnasTabla();
          this.EstableceColumnas(this.columnasBase);
          this.refrescarTabla(true);
        }
      });
  }

   // Obtiene las columas disponibles para mostrase en la tabla
   private GetColumnasTabla(): ColumnaTabla[] {
    const columnas: ColumnaTabla[] = [];

    const Propiedades: Propiedad[] = this.editorService.metadatos.Propiedades
    .sort((a, b) => (a.IndiceOrdenamientoTabla > b.IndiceOrdenamientoTabla) ? 1 : -1 );

    for (let i = 0; i < Propiedades.length; i++) {
      const c = this.editorService.metadatos.Propiedades[i];

        if (c.MostrarEnTabla ) {
          columnas.push({
            Id: c.Id,
            Nombre: c.Nombre,
            Ordenable: c.Ordenable,
            Buscable: c.Buscable,
            Visible: c.Visible,
            Alternable: c.AlternarEnTabla,
            Tipo: c.TipoDatoId,
            NombreI18n: c.NombreI18n,
          });
        }
    }
    return columnas;
  }


  // Genra el iltro base para las entidades con eliminación lógica
  private FiltroEliminadas(): FiltroConsulta {
    return  {
          Negacion: false, Operador: Operacion.OP_EQ,
          ValorString: 'false', Propiedad: 'Eliminada', Id: 'Eliminada',
          Valor: [true],
        };
  }

  // Ontiene la validación apra los filtros añadidos
  // y obtiene una nueva pa´gina si los fisltros son válidos
  FiltrosListosListener(): void {
    this.editorService
      .ObtieneFiltrosValidos()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((validos) => {
        if (validos) {
          if (this.eliminarLogico && (this.filtros.length === 0)) {
            this.filtros.push(this.FiltroEliminadas());
          }
          this.entidadSeleccionada = null;
          this.editorService.EntidadSeleccionada(this.entidadSeleccionada);
          this.consulta.FiltroConsulta = this.filtros;
          this.refrescarTabla(true);
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
      });
  }


  EliminarEntidades(): void {
    const msg = this.eliminarLogico ?
    'editor-pika.mensajes.warn-crud-eliminar-logico' : 'editor-pika.mensajes.warn-crud-eliminar';
    this.translate.get(msg, { nombre: this.ObtenerNombre(this.entidadSeleccionada) }).pipe(first())
    .subscribe( m =>  {
      this.dialogComnfirmDelRef = this.dialogService
      .open(this.dialogConfirmDelete, { context: m });
    });
  }

     // INtenta obtener le nombre de la entidad para el despliegue
     private ObtenerNombre(entidad: any): string {
      let n: string = '';
      if (entidad['Nombre']) n = entidad['Nombre'];
      if ((n === '') && (entidad['Descripcion'])) n = entidad['Descripcion'];
      return n;
   }


  // Se llama desde el template
  private ConfirmarEliminarEntidades() {
    this.dialogComnfirmDelRef.close();
    this.editorService.EliminarEntidad(this.entidadSeleccionada.Id,
      this.ObtenerNombre(this.entidadSeleccionada), '');
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
    this.configuration.selectRow = true;
    this.configuration.checkboxes = false;
}


  AlternarCheckboxes(): void {
    this.configuration.checkboxes = !this.configuration.checkboxes;
    this.configuration.selectRow = !this.configuration.checkboxes;
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
  }
}
