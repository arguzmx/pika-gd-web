import { AppEventBus } from './../../../@pika/state/app-event-bus';
import { Paginado } from './../../../@pika/consulta/paginado';
import { ValorListaOrdenada } from './../../../@pika/metadata/valor-lista';
import { CacheFiltrosBusqueda } from './../../services/cache-filtros-busqueda';
import { EntidadesService } from './../../services/entidades.service';
import { first, takeUntil } from 'rxjs/operators';
import { EditorEntidadesBase } from './../../model/editor-entidades-base';
import {
  Component, OnInit, Input, OnChanges, SimpleChanges,
  ViewChild, TemplateRef, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, AfterViewInit, OnDestroy
} from '@angular/core';
import { ConfiguracionEntidad } from '../../model/configuracion-entidad';
import { ITablaMetadatos } from '../../model/i-tabla-metadatos';
import { Config, DefaultConfig, Columns, APIDefinition, API } from 'ngx-easy-table';
import { TranslateService } from '@ngx-translate/core';
import { FiltroConsulta, Operacion, Consulta, HTML_DATE, HTML_DATETIME, HTML_TIME, PropiedadesExtendidas, tTime, tDate, tDateTime, tString, PropiedadExtendida, DocumentoPlantilla } from '../../../@pika/pika-module';
import { EntidadVinculada } from '../../../@pika/pika-module';
import { ColumnaTabla } from '../../model/columna-tabla';
import { Propiedad, MetadataInfo } from '../../../@pika/pika-module';
import { TablaEventObject } from '../../model/tabla-event-object';
import { AppLogService } from '../../../@pika/pika-module';
import { NbDialogService, NbSelectComponent } from '@nebular/theme';
import { Router } from '@angular/router';
import { Traductor } from '../../services/traductor';
import { addMinutes, format } from 'date-fns';
import { DiccionarioNavegacion } from '../../model/i-diccionario-navegacion';
import { Acciones, HTML_CHECKBOX, HTML_LABEL, HTML_NUMBER, HTML_TEXT, tBinaryData, tBoolean, tDouble, tIndexedString, tInt32, tInt64, TipoDato, tList } from '../../../@pika/metadata';
import { ConsultaBackend } from '../../../@pika/consulta';
import { BusquedaContenido, HighlightHit } from '../../../@busqueda-contenido/busqueda-contenido.module';
import { AsyncSubject, Observable, Subject, timer } from 'rxjs';

@Component({
  selector: 'ngx-metadata-tabla',
  templateUrl: './metadata-tabla.component.html',
  styleUrls: ['./metadata-tabla.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetadataTablaComponent extends EditorEntidadesBase
  implements ITablaMetadatos, OnInit, OnChanges, OnDestroy {

  @ViewChild('table', { static: true }) table: APIDefinition;
  @ViewChild('boolTpl', { static: true }) boolTpl: TemplateRef<any>;
  @ViewChild('cataloLinkTpl', { static: true }) cataloLinkTpl: TemplateRef<any>;
  @ViewChild('fechaTpl', { static: true }) fechaTpl: TemplateRef<any>;
  @ViewChild('listTpl', { static: true }) listTpl: TemplateRef<any>;
  @ViewChild('indexStrTpl', { static: true }) indexStrTpl: TemplateRef<any>;
  @ViewChild('strHTMLTpl', { static: true }) strHTMLTpl: TemplateRef<any>;
  @ViewChild('dialogColPicker', { static: true }) dialogColPicker: TemplateRef<any>;
  @ViewChild('listaplantilla') listaplantilla: NbSelectComponent;

  private dialogColPickRef: any;
  private onDestroy$: Subject<void> = new Subject<void>();

  // Parámetros de configuración
  @Input() config: ConfiguracionEntidad;
  @Input() idSeleccion: string;
  @Input() metadata: MetadataInfo;
  @Input() busuedaPersonalizada: boolean = false;
  @Output() NuevaSeleccion = new EventEmitter();
  @Output() NuevaSeleccionMultiple = new EventEmitter();
  @Output() EditarSeleccion = new EventEmitter();
  @Output() ConteoRegistros = new EventEmitter();
  @Output() EventoResultadoBusqueda = new EventEmitter();

  // Determina si la entidad en edición se elimina de manera lógica
  public eliminarLogico: boolean = false;

  // Instancia de i18n
  public T: Traductor;

  // Entidades vinculadas para la edición
  private vinculos: EntidadVinculada[] = [];


  private IdBusquedaPersonalizada: string = '';

  // Define si el paginao de la entidad es relacional
  private usarPaginadoRelacional: boolean = false;


  // Plantillas de datos disponibles
  public plantillas: ValorListaOrdenada[] = [];
  public plantillaSeleccionada: string = '';

  
  // Datos y columnas para EasyTables en el template
  public muestraOCR: boolean = false;
  public entidadseleccionada: any = null;
  public entidadesseleccionadas: any[] = [];
  public renglonSeleccionado: number = -1;
  public renglonesSeleccionados = new Set();;
  public configuration: Config;
  public data: any[];
  public HighlightHits: HighlightHit[];
  public columns: Columns[] = [];
  public columnasBase: ColumnaTabla[] = [];
  public columnasExtendias: string[] = [];
  public AsociadoMetadatos: boolean = false;
  private tmpcolumnas: ColumnaTabla[] = [];
  public pagination = {
    limit: 10,
    offset: 0,
    count: -1,
    sort: '',
    order: '',
  };
  
  private timeZoneOffset = new Date().getTimezoneOffset();

  private _CerrarDialogos() {
    if (this.dialogColPickRef && !this.dialogColPickRef.closed) this.dialogColPickRef.close();
  }

  // Inicializa el espacio de tabla
  public _Reset(): void {
    this.HighlightHits = [];
    this.muestraOCR = false;
    this.IdBusquedaPersonalizada = '';
    this.plantillaSeleccionada = '';
    this.AsociadoMetadatos = false;
    this._CerrarDialogos();
    this.entidadseleccionada = null;
    this.entidadesseleccionadas = [];
    this.renglonSeleccionado = -1;
    this.data = null;
    this.columnasExtendias = [];
    this.columns = [];
    this.columnasBase = [];
    this.tmpcolumnas = [];
    this.eliminarLogico = false;
    this.vinculos = [];
    this.usarPaginadoRelacional = false;
    this.consulta.FiltroConsulta = [];
    this.consulta.ord_columna = '';
    this.consulta.ord_direccion = '';
    this.pagination = {
      limit: 10,
      offset: 0,
      count: -1,
      sort: '',
      order: '',
    };
    this.consulta =  this.GetConsultaInicial();
    this.configuration.checkboxes = false;
    this.idSeleccion = '';
  }


  private GetConsultaInicial(): Consulta {
    return {
      indice: 0,
      tamano: 10,
      ord_columna: '',
      ord_direccion: '',
      recalcular_totales: true,
      consecutivo: 0,
      FiltroConsulta: [],
    };
  } 

  // Consulta base para el despliegue de datos
  public consulta: Consulta;
  public consultaIds: ConsultaBackend;
  private timerRefresco;
  private iteracionesTimer: number;

  constructor(
    appeventBus: AppEventBus,
    private cdr: ChangeDetectorRef,
    private cacheFilros: CacheFiltrosBusqueda,
    entidades: EntidadesService,
    translate: TranslateService,
    diccionarioNavegacion: DiccionarioNavegacion,
    applog: AppLogService, router: Router, private dialogService: NbDialogService) {
    super(appeventBus, entidades, applog, router, diccionarioNavegacion);
    this.consulta = this.GetConsultaInicial();
    this.T = new Traductor(translate);
  }

  ngOnDestroy(): void {
    this.onDestroy$.next(null);
    this.onDestroy$.complete();
  }
  

  private IniciaTimerRefresco() {
    this.iteracionesTimer = 10;
    this.timerRefresco = timer(100, 500).subscribe(t => {
      this.cdr.detectChanges();
      this.iteracionesTimer -=1;
      if (this.iteracionesTimer == 0){
        this.DetieneTimerRefresco();
      }
    });
  }

  private DetieneTimerRefresco() {
    this.timerRefresco.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'metadata':
            this.ProcesaConfiguracion();
            break;

          case 'idSeleccion':
              this.GetDataPage(true);
              break;            
        }
      }
    }
  }


  ngOnInit(): void {
    this.ConfiguraTabla();
    this.CargaTraducciones();
    this.ObtienePlantillas();
  }


  // Procesamiento del componente
  // --------------------------------------------------------------------
  // --------------------------------------------------------------------
  private ProcesaConfiguracion() {
    if (this.metadata) {
      this.eliminarLogico = (this.metadata.ElminarLogico === true) ? true : false;
      this.metadata = this.ProcesarMetadatos(this.metadata);
      if (this.metadata.EntidadesVinculadas) {
        this.metadata.EntidadesVinculadas.forEach(e => {
          this.vinculos.push(e);
          this.T.ts.push('entidades.' + e.EntidadHijo.toLowerCase());
        });
      }
      this.T.ObtenerTraducciones();
      this.consulta.FiltroConsulta = [];
      if (this.eliminarLogico) {
        this.consulta.FiltroConsulta.push(this.FiltroEliminadas());
      }
      this.columnasBase = this.GetColumnasTabla();
      this.EstableceColumnas(this.columnasBase);
      if (!this.busuedaPersonalizada) {
        this.GetDataPage(false);
      }
    }
  }

  // Genra el iltro base para las entidades con eliminación lógica
  private FiltroEliminadas(): FiltroConsulta {
    return {
      Negacion: false, Operador: Operacion.OP_EQ,
      ValorString: 'false', Propiedad: 'Eliminada', Id: 'Eliminada',
      Valor: [true],
    };
  }

  private CargaTraducciones(): void {
    this.T.ts = ['ui.cerrar', 'ui.selcol', 'ui.eliminar', 'ui.confirmar', 'ui.propiedades', 'ui.plantillas'];
    this.T.ObtenerTraducciones();
  }

  // Establece las propiedades por defecto de los metadatos
  private ProcesarMetadatos(m: MetadataInfo): MetadataInfo {
    this.usarPaginadoRelacional = false;

    // Añade propiedades de paginado relacional si viene la información del ruteo
    if (this.config.OrigenId !== '' && this.config.OrigenTipo !== '') {
      m.PaginadoRelacional = true;
    }

    this.AsociadoMetadatos = m.AsociadoMetadatos;

    if (m.PaginadoRelacional && m.PaginadoRelacional === true) {
      this.usarPaginadoRelacional = true;
      for (let i = 0; i < m.Propiedades.length; i++) {
        if (m.Propiedades[i].Id === 'OrigenId') m.Propiedades[i].ValorDefault = this.config.OrigenId;
        if (m.Propiedades[i].Id === 'TipoOrigenId') m.Propiedades[i].ValorDefault = this.config.OrigenTipo;
      }
    }
    return m;
  }

  // Procesamiento de tabla
  // --------------------------------------------------------------------
  // --------------------------------------------------------------------

  private NotificarErrorDatos(cantidad: number): void {
    this.applog.FallaT('editor-pika.mensajes.err-pagina-datos', null,
      { cantidad: 0 });
  }

  private NotificarConteo(cantidad: number): void {
    this.applog.ExitoT('editor-pika.mensajes.ok-pagina-datos', null,
      { cantidad: cantidad });
  }

  private AnularSeleccion(): void {
    this.entidadesseleccionadas = [];
    this.entidadseleccionada = null;
    this.renglonSeleccionado = -1;
    this.NuevaSeleccion.emit(this.entidadseleccionada);
    this.NuevaSeleccionMultiple.emit(this.entidadesseleccionadas)
  }

  // Otiene la etqueta para una celda con un Id
  public EtiquetaDeId(Id: string, EntidadId: string) {
    // El texto para ls etiqeutas viene desde el servicio de entidades
    // Y se carga tras el paginado
    if (this.metadata) {
      const i = this.metadata.Propiedades.findIndex(x => x.Id === EntidadId);
      let e = '';
      if (i >= 0 && this.metadata.Propiedades[i].AtributoLista) {
        e = this.metadata.Propiedades[i].AtributoLista.Entidad;
        const index = this.entidades.ListaIds.findIndex(x => x.Id === Id &&
          x.Entidad === e);
        if (index >= 0) {
          return this.entidades.ListaIds[index].Texto;
        }
      }
    }
    return Id;
  }

  public EtiquetasFecha(f: Date, EntidadId: string, column: any, rowIndex: any) {

    if (!this.metadata) return '';

    const p = this.metadata.Propiedades.find(x => x.Id === EntidadId);
    let texto = '';
    if (p) {
      const c = p.AtributosVistaUI.find(x => x.Plataforma === 'web');
      if (f) {
        const fechaSinOffset = new Date(f);
        const fecha = addMinutes(fechaSinOffset, (this.timeZoneOffset * -1));
        switch (c.Control) {
          case HTML_DATE:
            texto = format(fecha, 'yyyy-MM-dd');
            break;
          case HTML_DATETIME:
            texto = format(fecha, 'yyyy-MM-dd HH:mm:ss');
            break;
          case HTML_TIME:
            texto = format(fecha, 'HH:mm:ss');
            break;
        }
      }
    }
    return texto;
  }

  // Otiene la etqueta para una celda con un Id
  public EtiquetasDeCatalogo(Id: string[], EntidadId: string) {
    // El texto para ls etiqeutas viene desde el servicio de entidades
    // Y se carga tras el paginado
    const texto: string[] = [];
    const v = this.metadata.CatalogosVinculados.find(x => x.PropiedadReceptora === EntidadId);
    if (v) {
      Id.forEach(i => {
        const index = this.entidades.ListaIds.findIndex(x => x.Id === i &&
          x.Entidad === v.EntidadCatalogo);
        if (index >= 0) {
          texto.push(this.entidades.ListaIds[index].Texto);
        } else {
          texto.push(i);
        }
      });

    }
    return texto;
  }

  // establece la configuración de las columnas de la tabla  a partir de los metadatos recibidos
  private EstableceColumnas(columnas: ColumnaTabla[]): void {
    this.columns = [];
    for (let i = 0; i < columnas.length; i++) {
      if (columnas[i].Visible) {
        let template = null;
        if (columnas[i].Tipo === tIndexedString) template = this.indexStrTpl;
        if (columnas[i].Id === 'ocr') template = this.strHTMLTpl;
        if (columnas[i].EsFecha) template = this.fechaTpl;
        if (columnas[i].Tipo === 'bool') template = this.boolTpl;
        if (columnas[i].EsLista) template = this.listTpl;
        if (columnas[i].EsCatalogoVinculado) template = this.cataloLinkTpl;

        this.columns.push({
          key: columnas[i].Id,
          title: columnas[i].NombreI18n,
          orderEnabled: columnas[i].Ordenable,
          searchEnabled: columnas[i].Buscable,
          cellTemplate: template
        });
      }
    }
    if (this.columns.length > 4) {
      this.configuration.horizontalScroll = true;
    } else {
      this.configuration.horizontalScroll = false;
    }
  }


  // Obtiene las columas disponibles para mostrase en la tabla
  private GetColumnasTabla(): ColumnaTabla[] {
    const columnas: ColumnaTabla[] = [];

    const Propiedades: Propiedad[] = this.metadata.Propiedades
      .sort((a, b) => (a.IndiceOrdenamientoTabla > b.IndiceOrdenamientoTabla) ? 1 : -1);

    for (let i = 0; i < Propiedades.length; i++) {
      const c = this.metadata.Propiedades[i];

      if (c.MostrarEnTabla) {
        let eslista = false;
        const esFecha = ['date', 'datetime', 'time'].indexOf(c.TipoDatoId) < 0 ? false : true;
        if (c.AtributoLista && c.AtributoLista.DatosRemotos && c.AtributoLista.Entidad !== '') {
          eslista = true;
        }
        if (c.MostrarEnTabla) {
          columnas.push({
            Id: c.Id,
            Nombre: c.Nombre,
            Ordenable: c.Ordenable,
            Buscable: c.Buscable,
            Visible: c.Visible,
            Alternable: c.AlternarEnTabla,
            Tipo: c.TipoDatoId,
            NombreI18n: c.NombreI18n,
            EsLista: eslista,
            EsCatalogoVinculado: c.CatalogoVinculado,
            EsFecha: esFecha,
            EsPropiedadExtendida: false
          });
        }
      }
    }
    return columnas;
  }

  private EstableceColumnasMetadatos(props: PropiedadesExtendidas) {
    const columnas: ColumnaTabla[] = [];

    if(this.muestraOCR){
      this.columnasBase.splice(this.columnasBase.length-1,1)
    }

    const pllantillas: string[] = []

    props.Propiedades.forEach(p => {
      if (pllantillas.indexOf(p.PlantillaId) < 0) {
        pllantillas.push(p.PlantillaId);
      }
    });

    pllantillas.forEach(pid => {
      this.plantillaSeleccionada = pid;
      if (this.columnasExtendias.indexOf(pid) < 0) {
        props.Propiedades.forEach(p => {

          if (p.PlantillaId == pid) {

            columnas.push({
              Id: p.Id,
              Nombre: p.Nombre,
              Ordenable: (p.TipoDatoId == tIndexedString) ? false : true,
              Buscable: true,
              Visible: true,
              Alternable: true,
              Tipo: p.TipoDatoId,
              NombreI18n: p.Nombre,
              EsLista: false,
              EsCatalogoVinculado: false,
              EsFecha: (p.TipoDatoId == tDateTime || p.TipoDatoId == tDate || p.TipoDatoId == tTime),
              EsPropiedadExtendida: true
            });


            this.metadata.Propiedades.push({
              Id: p.Id,
              Nombre: p.Nombre,
              NombreI18n: p.Nombre,
              TipoDatoId: p.TipoDatoId,
              ValorDefault: null,
              IndiceOrdenamiento: 0,
              Buscable: false,
              Ordenable: (p.TipoDatoId == tIndexedString) ? false : true,
              Visible: true,
              EsIdClaveExterna: false,
              EsIdRegistro: false,
              EsIdJerarquia: false,
              EsTextoJerarquia: false,
              EsIdRaizJerarquia: false,
              EsFiltroJerarquia: false,
              Requerido: false,
              Autogenerado: false,
              EsIndice: false,
              ControlHTML: this.ControlHTMLDePropiedadExtendida(p),
              TipoDato: this.TipoDatoDePropiedadExtendida(p),
              ValidadorTexto: null,
              ValidadorNumero: null,
              Atributos: null,
              AtributoLista: null,
              AtributosVistaUI: [{
                PropiedadId: p.Id,
                Control: this.ControlHTMLDePropiedadExtendida(p),
                Accion: Acciones.search,
                Plataforma: 'web'
              }],
              AtributosEvento: null,
              ValoresLista: null,
              OrdenarValoresListaPorNombre: false,
              Valor: null,
              MostrarEnTabla: true,
              AlternarEnTabla: true,
              IndiceOrdenamientoTabla: 0,
              Contextual: false,
              IdContextual: null,
              Etiqueta: false,
              CatalogoVinculado: false,
              EmitirCambiosValor: false,
              ParametroLinkVista: null
            });
          }
        });
        this.columnasExtendias.push(pid);
      }
    });


    if(this.muestraOCR) {
      columnas.push( { Id: 'ocr', Nombre: 'Texto', Visible: true, Alternable: false, Ordenable:false, Buscable: false,
      Tipo: tString, NombreI18n: 'Texto', EsLista: false, EsFecha: false, EsCatalogoVinculado: false, EsPropiedadExtendida: false } )
    }

    if (columnas.length > 0) {
      columnas.forEach(c => {
        this.columnasBase.push({ ...c });
      });
      this.EstableceColumnas(this.columnasBase);
    }
  }

  private ControlHTMLDePropiedadExtendida(p: PropiedadExtendida): string {

    switch (p.TipoDatoId) {
      case tIndexedString:
      case tString:
        return HTML_TEXT;

      case tBoolean:
        return HTML_CHECKBOX;

      case tDouble:
      case tInt32:
      case tInt64:
        return HTML_NUMBER;

      case tDateTime:
        return HTML_DATETIME;

      case tDate:
        return HTML_DATE;

      case tTime:
        return HTML_TIME;

      case tBinaryData:
        break;

      case tList:
        return HTML_TEXT;

    }

    return HTML_TEXT;
  }

  private TipoDatoDePropiedadExtendida(p: PropiedadExtendida): TipoDato {
    return {
      Id: p.Id,
      Nombre: ""
    }
  }

  public ObtieneIdsSeleccionados(): string[] {
    const lista: string[] = [];
    const campoId = this.ObtenerCampoIdEntidad();
    if(this.configuration.checkboxes) {
      if(this.entidadesseleccionadas.length>0){
        this.entidadesseleccionadas.forEach(item=> {
          lista.push(item[campoId]);
        });
      } 
    } else {
      if(this.entidadseleccionada!=null){
        lista.push(this.entidadseleccionada[campoId]);
      } 
    }
    return lista;
  }

  // listener para eventos de la tabla
  eventosTabla($event: { event: string; value: any }): void {
    this.LimpiarSeleccion();
    switch ($event.event) {
      case 'onOrder':
      case 'onPagination':
        this.onPagination($event);  
        if (this.configuration.checkboxes) {
          this.renglonesSeleccionados.clear()
          this.entidadesseleccionadas = [];
          this.NuevaSeleccionMultiple.emit(this.entidadesseleccionadas);
        } else {
          this.renglonSeleccionado = -1;
          this.entidadseleccionada = null;
          this.NuevaSeleccion.emit(this.entidadseleccionada);
        }
        break;

      case 'onClick':
        if (!this.configuration.checkboxes) {
          this.renglonSeleccionado = $event.value.rowId;
          this.entidadseleccionada = $event.value.row;
          this.NuevaSeleccion.emit(this.entidadseleccionada);
          this.SetSeleccion(this.renglonSeleccionado);        
        } 
        break;

      case 'onDoubleClick':
        if (!this.configuration.checkboxes) {
          this.renglonSeleccionado = $event.value.rowId;
          this.entidadseleccionada = $event.value.row;
          this.EditarSeleccion.emit(this.entidadseleccionada);
          this.SetSeleccion(this.renglonSeleccionado);
        }

        case 'onCheckboxSelect':
          if (this.renglonesSeleccionados.has($event.value.rowId)) {
            const campoId = this.ObtenerCampoIdEntidad();
            const index = this.entidadesseleccionadas.findIndex(x=>x[campoId] == $event.value.row[campoId]);
            if(index>=0) this.entidadesseleccionadas.splice(index,1);
            this.renglonesSeleccionados.delete($event.value.rowId);
          } else {
            this.renglonesSeleccionados.add($event.value.rowId);
            this.entidadesseleccionadas.push($event.value.row)
          }
          break;

        case 'onSelectAll':
          this.entidadesseleccionadas = [];
          this.data.forEach((_, key) => {
            if (this.renglonesSeleccionados.has(key)) {
              this.renglonesSeleccionados.delete(key);
            } else {
              this.renglonesSeleccionados.add(key);
              this.entidadesseleccionadas = this.data;
            }
          });
          break;      
        break;
    }

  }


  // GEstion de contenido de la tabla
  
  ///  Inicializa las opciones para la tabla
  ConfiguraTabla(): void {
    this.configuration = { ...DefaultConfig };
    this.configuration.isLoading = false;
    this.configuration.fixedColumnWidth  = false;
    this.configuration.serverPagination = true;
    this.configuration.threeWaySort = false;
    this.configuration.tableLayout.style = 'normal';
    this.configuration.tableLayout.striped = true;
    this.configuration.tableLayout.borderless = false;
    this.configuration.selectRow = false;
    this.configuration.checkboxes = false;
  }

  
  // evalua el evento de paginacdo
  private onPagination(obj: TablaEventObject): void {

    this.pagination.limit = obj.value.limit ? obj.value.limit : this.pagination.limit;
    this.pagination.offset = obj.value.page ? obj.value.page : this.pagination.offset;
    this.pagination.sort = !!obj.value.key ? obj.value.key : this.pagination.sort;
    this.pagination.order = !!obj.value.order ? obj.value.order : this.pagination.order;

    this.pagination = { ...this.pagination };
    if (this.busuedaPersonalizada) {
        this.obtenerPaginaPeronalizada(false);
    } else {
      this.obtenerPaginaDatos(false);
    }

  }

  // Obtiene una nueva página de datos
  public obtenerPaginaPeronalizada(notificar: boolean): void {

    this.consultaIds.indice = (this.pagination.offset - 1) < 0 ? 0 : this.pagination.offset - 1;
    this.consultaIds.tamano = this.pagination.limit;
    this.consultaIds.ord_columna = this.pagination.sort;
    this.consultaIds.ord_direccion = this.pagination.order;

    if (this.plantillaSeleccionada) {
       if(this.EsPropiedadExtendida(this.pagination.sort)) {
          this.RealizaPaginadoMetadatosPersonalizada();
          return;
       } 
    } 
    this.creaPaginaDatosPersonalizada(this.consultaIds);
  }

  // Obtiene una nueva página de datos
  public obtenerPaginaDatos(notificar: boolean): void {

    if (this.plantillaSeleccionada) {
       if(this.EsPropiedadExtendida(this.pagination.sort)) {
          this.RealizaPaginadoMetadatos();
          return;
       } 
    } 
    this.GetDataPage(notificar);
  }


  // ONtiene una pagina de datis a partir de los metadtos
  private RealizaPaginadoMetadatosPersonalizada() {
    
    const consultameta: Consulta = {
      indice: (this.pagination.offset - 1) < 0 ? 0 : this.pagination.offset - 1,
      tamano: this.pagination.limit,
      ord_columna: this.pagination.sort,
      ord_direccion: this.pagination.order,
      recalcular_totales: true,
      consecutivo: 0,
      FiltroConsulta: [],
      IdCache:  this.IdBusquedaPersonalizada
    };
    

    const cache = this.cacheFilros.GetCacheFiltros(this.config.TransactionId);
    cache.forEach(c => {
      this.metadata.Propiedades.forEach(p => {
        if (p.VinculoMetadatos) {
          if (c.Id == p.Id) {
            if (c.ValorString) {
              consultameta.FiltroConsulta.push({
                Id: p.VinculoMetadatos,
                Negacion: false,
                Propiedad: p.VinculoMetadatos,
                Operador: Operacion.OP_EQ,
                Valor: c.Valor,
                ValorString: c.ValorString,
                Valido: true
              });
            }
          }
        }
      });
    })

    consultameta.FiltroConsulta.push({
      Id: 'TDID',
      Negacion: false,
      Propiedad: "TDID",
      Operador: Operacion.OP_EQ,
      Valor: [this.metadata.FullName],
      ValorString: this.metadata.FullName,
      Valido: true
    });

    this.consulta.consecutivo = 0;
    this.consulta.indice = (this.pagination.offset - 1) < 0 ? 0 : this.pagination.offset - 1;
    this.consulta.tamano = this.pagination.limit;
    this.consulta.ord_columna = this.pagination.sort;
    this.consulta.ord_direccion = this.pagination.order;
    this.consulta = { ...this.consulta };


    this.entidades.ObtienePaginaMetadatos(this.plantillaSeleccionada, this.GeneraConsultaBackend(consultameta))
      .pipe(first()).subscribe(metadatos => {
        const ids = [];
        metadatos.Elementos.forEach(e=> {
            ids.push(e.DatoId);
        });
        
        const consultaIds =this.GeneraConsultaBackend(this.consulta);
        consultaIds.Ids = ids;
        // indica al backend que no debe completarse la página con elementos adicionales
        consultaIds.tamano = 0;
        this.entidades.ObtenerPaginaPorIds(this.metadata.Tipo, consultaIds)
        .pipe(first()).subscribe( elementos => {

          if (this.muestraOCR) {
            this.entidades.SinopisPorIds(this.consultaIds.IdCache, this.APaginado(elementos))
            .pipe(first()).subscribe( sinopsis => {
              this.HighlightHits = sinopsis;
              const updated: unknown[] = JSON.parse(JSON.stringify(elementos));
              updated.forEach(u=>{
                const s = sinopsis.find(x=>x.ElementoId == u['Id']);
                if (s) {
                  let texto = '';
                  s.Highlights.forEach(h=> {
                    texto = `${texto}${h.Texto}... `
                  });
                  u['ocr'] = texto;
                }
              });
              
              this.ActualizarDatosElemento(updated, metadatos);
              this.configuration.isLoading = false;
              this.IniciaTimerRefresco();
            })
          } else {
            
            this.ActualizarDatosElemento(elementos, metadatos);
            this.configuration.isLoading = false;
            this.IniciaTimerRefresco();
          }

          
        }, (err) => { console.error(err); })

      }, (err) => { console.error(err); });


  }


  // ONtiene una pagina de datis a partir de los metadtos
  private RealizaPaginadoMetadatos() {
    
    const consultameta: Consulta = {
      indice: (this.pagination.offset - 1) < 0 ? 0 : this.pagination.offset - 1,
      tamano: this.pagination.limit,
      ord_columna: this.pagination.sort,
      ord_direccion: this.pagination.order,
      recalcular_totales: true,
      consecutivo: 0,
      FiltroConsulta: [],
    };
    

    const cache = this.cacheFilros.GetCacheFiltros(this.config.TransactionId);
    cache.forEach(c => {
      this.metadata.Propiedades.forEach(p => {
        if (p.VinculoMetadatos) {
          if (c.Id == p.Id) {
            if (c.ValorString) {
              consultameta.FiltroConsulta.push({
                Id: p.VinculoMetadatos,
                Negacion: false,
                Propiedad: p.VinculoMetadatos,
                Operador: Operacion.OP_EQ,
                Valor: c.Valor,
                ValorString: c.ValorString,
                Valido: true
              });
            }
          }
        }
      });
    })

    consultameta.FiltroConsulta.push({
      Id: 'TDID',
      Negacion: false,
      Propiedad: "TDID",
      Operador: Operacion.OP_EQ,
      Valor: [this.metadata.FullName],
      ValorString: this.metadata.FullName,
      Valido: true
    });

    this.consulta.consecutivo = 0;
    this.consulta.indice = (this.pagination.offset - 1) < 0 ? 0 : this.pagination.offset - 1;
    this.consulta.tamano = this.pagination.limit;
    this.consulta.ord_columna = this.pagination.sort;
    this.consulta.ord_direccion = this.pagination.order;
    this.consulta = { ...this.consulta };

    this.entidades.ObtienePaginaMetadatos(this.plantillaSeleccionada, this.GeneraConsultaBackend(consultameta))
      .pipe(first()).subscribe(metadatos => {
        
        const ids = [];
        metadatos.Elementos.forEach(e=> {
            ids.push(e.DatoId);
        });

        const consultaIds =this.GeneraConsultaBackend(this.consulta);
        consultaIds.Ids = ids;

        this.entidades.ObtenerPaginaPorIds(this.metadata.Tipo, consultaIds)
        .pipe(first()).subscribe( elementos => {
          this.ActualizarDatosElemento(elementos, metadatos);
        }, (err) => { console.error(err); })

      }, (err) => { console.error(err); });

}


 // Ontiene una página de datos a partir de las entidades de la tabla
  public GetDataPage(notificar: boolean) {

    if(this.config){
      this.consulta.FiltroConsulta = this.cacheFilros.GetCacheFiltros(this.config.TransactionId || "" );
      this.consulta.IdSeleccion = this.idSeleccion ? this.idSeleccion:  null;
      this.consulta.consecutivo = 0;
      this.consulta.indice = (this.pagination.offset - 1) < 0 ? 0 : this.pagination.offset - 1;
      this.consulta.tamano = this.pagination.limit;
      this.consulta.ord_columna = this.pagination.sort;
      this.consulta.ord_direccion = this.pagination.order;
      
      this.consulta = { ...this.consulta };
      this.AnularSeleccion();
      this.data = [];
      this.configuration.isLoading = true;
      if (this.columns.length > 4) {
        this.configuration.horizontalScroll = true;
      } else {
        this.configuration.horizontalScroll = false;
      }
      if (this.usarPaginadoRelacional) {
        this.entidades.ObtenerPaginaRelacional(this.config.OrigenTipo,
          this.config.OrigenId, this.config.TipoEntidad, this.consulta)
          .pipe(first())
          .subscribe(data => {
            if (data) {
              this.ActualizaCamposLabel(data).pipe(first())
              .subscribe( newdata=> {
                this.ActualizarDatosPlantilla(newdata.Elementos || []);
                this.configuration.isLoading = false;
                this.ConteoRegistros.emit(newdata.ConteoTotal);
                if (notificar) this.NotificarConteo(newdata.ConteoTotal);                
              });
            } else {
              this.ConteoRegistros.emit(0);
              this.NotificarErrorDatos(data.ConteoTotal || 0);
            }
  
            this.pagination.offset = 0;
            this.pagination.limit = 10
            this.pagination.count = data.ConteoTotal;
            this.pagination = { ...this.pagination };
            this.IniciaTimerRefresco();
  
          });
      } else {
        this.entidades.ObtenerPagina(this.config.TipoEntidad, this.consulta)
          .pipe(first())
          .subscribe(data => {
            if (data) {
              this.ActualizaCamposLabel(data).pipe(first())
              .subscribe( newdata=> {
                this.ActualizarDatosPlantilla(newdata.Elementos || []);
                this.configuration.isLoading = false;
                this.ConteoRegistros.emit(newdata.ConteoTotal);
                if (notificar) this.NotificarConteo(newdata.ConteoTotal);
              });
            } else {
              this.NotificarErrorDatos(data.ConteoTotal);
            }
              this.pagination.count = data.ConteoTotal;
            this.pagination = { ...this.pagination };
            this.IniciaTimerRefresco();
          });
      }
    }
    
  }

  private ActualizaCamposLabel(data: Paginado<any>): Observable<Paginado<any>> {
    const subject = new AsyncSubject<Paginado<any>>();
    const etiquetas = [];
    this.metadata.Propiedades.forEach(p=> {
      p.AtributosVistaUI.forEach(a=> {
        if(a.Control === HTML_LABEL) {
          etiquetas.push(a.PropiedadId);
        }
      })
    });

    const valores = [];
    data.Elementos.forEach(d=> {
      etiquetas.forEach(e=> {
        if(valores.indexOf(d[e])<0){
          valores.push(d[e]);
        }
      })
    });

    if(valores.length > 0) {
      this.T.ObtenerTraduccion(valores).subscribe(traducciones=> {
        data.Elementos.forEach(d=> {
            etiquetas.forEach(e=> {
              d[e] = traducciones[d[e]];
            })          
        });
        subject.next(data);
        subject.complete();
      }, () => {
        subject.next(data);
        subject.complete();
      });
    } else {
        subject.next(data);
        subject.complete();
    }
    return subject;
  }


  private RealizaPaginadoPorObjeto() {
    if (this.busuedaPersonalizada) {
      if (this.consultaPersonalizada) {
        this.consultaPersonalizada["consecutivo"] = 0;
        this.consultaPersonalizada["indice"] = (this.pagination.offset - 1) < 0 ? 0 : this.pagination.offset - 1;
        this.consultaPersonalizada["tamano"] = this.pagination.limit;
        this.consultaPersonalizada["ord_columna"] = this.pagination.sort;
        this.consultaPersonalizada["ord_direccion"] = this.pagination.order;
        this.consultaPersonalizada["recalcular_totales"] = false;
        this.obtenerPaginaDatosPersonalizada(false, this.urlPersonalizado, this.consultaPersonalizada);
      }
    } else {
      if (this.consulta) {
        this.consulta.consecutivo = 0;
        this.consulta.indice = (this.pagination.offset - 1) < 0 ? 0 : this.pagination.offset - 1;
        this.consulta.tamano = this.pagination.limit;
        this.consulta.ord_columna = this.pagination.sort;
        this.consulta.ord_direccion = this.pagination.order;
        this.consulta = { ...this.consulta };
        this.GetDataPage(false);
      }
    }
  }



 private ActualizarDatosElemento(pagedata: unknown[], metadatos: Paginado<DocumentoPlantilla>): void {
    const newpage: any[] = [];

    const ids: string[] = [];
      metadatos.Elementos.forEach(r => {
        ids.push(r.DatoId);
      });

      const idEntidad = this.ObtenerCampoIdEntidad();
      var index = 0;
      const encontrados: string[] = [];
      
      ids.forEach(id => {
        for(var i=0; i<pagedata.length;i++){
          if(id==pagedata[i][idEntidad]){
            const valores = metadatos.Elementos[i]['Valores'];
            const r = {};
                      
            this.columnasBase.forEach(p => {
              if (!p.EsPropiedadExtendida) {
                r[p.Id] = pagedata[i][p.Id];
              }
            });

            for (var v = 0; v < valores['length']; v++) {
              r[valores[v]['PropiedadId']] = valores[v]['Valor'];
            }
            newpage.push(r);
            encontrados.push(id)
            break;
          }
        }
      });

      pagedata.forEach( r => {
        const i = encontrados.indexOf(r[idEntidad]);
        if (i<0) {
          const e = {};
          this.columnasBase.forEach(p => {
            if (!p.EsPropiedadExtendida) {
              e[p.Id] = r[p.Id];
            }
          });
          newpage.push(e);
        }
      });

      this.data = newpage;
      this.IniciaTimerRefresco();
  }


  // Muestra los datos de la plantilla seleccionada en las columnas de metadatos
  private ActualizarDatosPlantilla(pagedata: unknown[]): void {
    const newpage: any[] = [];

    if (this.plantillaSeleccionada != '') {
      
      const ids: string[] = [];
      pagedata.forEach(r => {
        ids.push(this.ObtenerIdEntidad(r));
      });

      this.entidades.POSTURLPersonalizada({ Ids: ids }, `api/v1.0/Metadatos/${this.plantillaSeleccionada}/lista/${this.metadata.FullName}/id`).pipe(first())
        .subscribe(metadata => {

          if (metadata) {
          
            var index = 0;
            // Para cada Id de la página
            ids.forEach(id => {

              if (metadata) {

                var encontrada = false;

                for (var i = 0; i < metadata['length']; i++) {
                  
                  if (metadata[i]['DatoId'] == id) {
                      // toma los valores de los metadatos
                      const valores = metadata[i]['Valores'];
                      // registro encontrado
                      const r = {};
                      
                      this.columnasBase.forEach(p => {
                        if (!p.EsPropiedadExtendida) {
                          r[p.Id] = pagedata[index][p.Id];
                        }
                      });

                      for (var v = 0; v < valores['length']; v++) {
                        r[valores[v]['PropiedadId']] = valores[v]['Valor'];
                      }

                      newpage.push(r);
                      encontrada = true;
                      break;
                  }

                }

                if (!encontrada) newpage.push( pagedata[index] );

              } else {
                newpage.push( pagedata[index] );
              }

              index ++;
            });
            // rcorre cada renglon de los metadatos 
            this.data = newpage;
            this.IniciaTimerRefresco();

          } else {
            this.data = pagedata;
            this.IniciaTimerRefresco();
          }

        }, (err) => { this.data = []; this.IniciaTimerRefresco(); });

    } else {
      // no hay una plantilla seleccionada
      this.data = pagedata;
      this.IniciaTimerRefresco();
    }
  }



  private urlPersonalizado: string;
  private consultaPersonalizada: unknown;

  private APaginado(elementos: any[]) : Paginado<any> {
    return {
      Elementos: elementos,
      Desde: 0,
      Indice: 0,
      Tamano: 0,
      ConteoTotal: 0,
      Paginas: 0,
      TienePrevio: false,
      TieneSiguiente: false
    }
  }


  private creaPaginaDatosPersonalizada(consultaIds: ConsultaBackend) {

    this.AnularSeleccion();
    this.data = [];
    this.configuration.isLoading = true;
    if (this.columns.length > 4) {
      this.configuration.horizontalScroll = true;
    } else {
      this.configuration.horizontalScroll = false;
    }

    this.entidades.ObtenerPaginaPorIds(this.metadata.Tipo, {... consultaIds} )
    .pipe(first()).subscribe( elementos => {
      
      if (elementos) {
        this.entidades.BuscaTextoDeIdentificadores(this.metadata.Tipo, this.APaginado(elementos), this.metadata)
        .pipe(first()).subscribe( ok => {
          if (this.muestraOCR) {
            this.entidades.SinopisPorIds(this.consultaIds.IdCache, this.APaginado(elementos))
            .pipe(first()).subscribe( sinopsis => {
              this.HighlightHits = sinopsis;
              const updated: unknown[] = JSON.parse(JSON.stringify(elementos));
              updated.forEach(u=>{
                const s = sinopsis.find(x=>x.ElementoId == u['Id']);
                if (s) {
                  let texto = '';
                  s.Highlights.forEach(h=> {
                    texto = `${texto}${h.Texto}... `
                  });
                  u['ocr'] = texto;
                }
              });
              this.ActualizarDatosPlantilla(updated || []);
              this.configuration.isLoading = false;
              this.IniciaTimerRefresco();
            })
          } else {
            this.ActualizarDatosPlantilla(elementos || []);
            this.configuration.isLoading = false;
            this.IniciaTimerRefresco();
          }
        });

      } else {
        this.NotificarErrorDatos(0);
      }

    }, (err) => { this.configuration.isLoading = false; })
  }


  private instanceOfBusquedaContenido(object: any): object is BusquedaContenido {
    return 'Elementos' in object;
  }


  private EstableceColumnasBusquedaTexto() {
    const columnas: ColumnaTabla[] = [];
    if(this.columnasBase.find(x=>x.Id == 'ocr')){

      return;
    }

    columnas.push( { Id: 'ocr', Nombre: 'Texto', Visible: true, Alternable: false, Ordenable:false, Buscable: false,
      Tipo: tString, NombreI18n: 'Texto', EsLista: false, EsFecha: false, EsCatalogoVinculado: false, EsPropiedadExtendida: false } )

      if (columnas.length > 0) {
        columnas.forEach(c => {
          this.columnasBase.push({ ...c });
        });
        this.EstableceColumnas(this.columnasBase);
      }
  }


  // Obtiene una nueva página de datos
  public obtenerPaginaDatosPersonalizada(notificar: boolean, path: string, consulta: unknown): void {

    this.entidades.POSTURLPersonalizada(consulta, path)
      .pipe(first())
      .subscribe(data => {

        if( this.instanceOfBusquedaContenido(consulta) ){
          const bcont: BusquedaContenido = JSON.parse(JSON.stringify(consulta));
          if (bcont.Elementos.find(x=>x.Tag=="texto")){
            this.muestraOCR = true;
            this.EstableceColumnasBusquedaTexto();
          }
        }

        // Obtiene el id de la consylta
        this.IdBusquedaPersonalizada = data["Elementos"][0];
        this.busuedaPersonalizada = true;
        const conteo = data["ConteoTotal"];

        const consultaBase = this.GetConsultaInicial();
        consultaBase.IdCache = this.IdBusquedaPersonalizada;

        this.consulta.FiltroConsulta = consulta["FiltrosBase"];
        this.consultaIds = this.GeneraConsultaBackend(consultaBase);

        this.consultaIds.IdCache = this.IdBusquedaPersonalizada;
        this.consultaIds.Filtros = consulta["FiltrosBase"];
        
        this.creaPaginaDatosPersonalizada(this.consultaIds);
        this.ConteoRegistros.emit(conteo);

        this.NotificarConteo(conteo);
        this.pagination.limit = 10;
        this.pagination.offset = 0;
        this.pagination.count = conteo;
        this.pagination = { ...this.pagination };
        this.IniciaTimerRefresco();
  

      });

    
  }



  // Procesamiento de opciones de la tabla
  // --------------------------------------------------------------------
  // --------------------------------------------------------------------

  // Mustra el selector de columnas
  public MostrarSelectorColumnas(): void {
    this.tmpcolumnas = this.columnasBase.map((obj) => ({ ...obj }));
    this.dialogColPickRef = this.dialogService
      .open(this.dialogColPicker, { context: '' })
      .onClose.subscribe(() => {
        this.CheckColumnasSeleccionadas();
      });
  }

  // realiza el alternado de columnas
  public AlternarColumna(id: any, checked: boolean): void {
    const updateItem = this.tmpcolumnas.filter((x) => x.Id === id)[0];
    const index = this.tmpcolumnas.indexOf(updateItem);
    updateItem.Visible = checked;
    this.tmpcolumnas[index] = updateItem;
  }

  // verifica qu ela menos existe una columna disonible
  private CheckColumnasSeleccionadas() {
    if (this.tmpcolumnas.filter((x) => x.Visible === true).length === 0) {
      this.applog.AdvertenciaT('editor-pika.mensajes.warn-sin-columnas');
      this.MostrarSelectorColumnas();
    } else {
      this.columnasBase = this.tmpcolumnas.map((obj) => ({ ...obj }));
      this.EstableceColumnas(this.columnasBase);
    }
  }


  public SetSeleccion(i: number): void {
    const val = { row: i + 1, attr: 'background-color', value: '#9ECDFF' };
    this.table.apiEvent({
      type: API.setRowStyle,
      value: val,
    });
  }

  public LimpiarSeleccion(): void {
    const color_par = '#FFFFFF';
    const color_non = '#f6f7f9';
    let color: string;
    if (this.data) {
      for (let index = 0; index < this.data.length; index++) {
        if (((index + 1) % 2) === 0) {
          color = color_par;
        } else {
          color = color_non;
        }
        const val = { row: index + 1, attr: 'background-color', value: color };
        this.table.apiEvent({
          type: API.setRowStyle,
          value: val,
        });
      }
    }
  }

  public elementoSeleccionado(): any {
    return this.entidadseleccionada;
  }

  public elementosSeleccionados(): any[] {
    return this.entidadesseleccionadas;
  }

  public elminaColumnasMetadatos() {
    const columnas = [];
    this.columnasBase.forEach(c => {
      if (!c.EsPropiedadExtendida) {
        columnas.push(c);
      }
    });
    this.columnasBase = columnas;
    this.tmpcolumnas = columnas;
  }


  public cambioPlantilla(id: string) {

    this.elminaColumnasMetadatos();
    const propiedades: PropiedadesExtendidas = {
      Propiedades: []
    };
    this.columnasExtendias = [];
    if (id != '') {
      this.entidades.ObtieneMetadataInfo(id).pipe(first())
        .subscribe((data) => {
          data.Propiedades.forEach(p => {
            propiedades.Propiedades.push({
              PlantillaId: id,
              Id: p.Id,
              Nombre: p.Nombre,
              TipoDatoId: p.TipoDatoId
            });
          });
          this.EstableceColumnasMetadatos(propiedades);
          this.ActualizarDatosPlantilla(this.data);
        }, (e) => { }, () => { });
    }

  }

  // Obtiene las plantillas disponibles para el documento
  private ObtienePlantillas(): void {
    this.entidades.ObtienePlantillas().pipe(first())
      .subscribe((data) => {
        const lista: ValorListaOrdenada[] = [];
        lista.push({ Id: '', Texto: 'Ninguno', Indice: 0 });

        data.forEach(d => {
          lista.push({ ...d });
        });

        this.plantillas = lista;
      }, (e) => { }, () => { });
  }


  private GeneraConsultaBackend(c: Consulta): ConsultaBackend {
    const q :ConsultaBackend = {
      consecutivo: c.consecutivo,
      indice: c.indice,
      ord_columna: c.ord_columna,
      ord_direccion: c.ord_direccion,
      recalcular_totales: c.recalcular_totales,
      tamano: c.tamano,
      Filtros: [],
      Ids: [],
      IdCache: c.IdCache
    };

    c.FiltroConsulta.forEach(f => {
      
      // var s = "";
      // if(f.Valor ) {
      //   f.Valor.forEach(v => {
      //     s += v;
      //   });
      // }
      q.Filtros.push(
        {
          Propiedad: f.Propiedad,
          Negacion: f.Negacion,
          Operador: f.Operador,
          Valor: "",
          ValorString: f.ValorString,
          NivelFuzzy: -1
        }
      );
    });

    return q;
  }

  public ObtenerIdEntidad(entidad: any): string {
    const index = this.metadata.Propiedades.findIndex(x => x.EsIdRegistro === true);
    if (index >= 0) {
      return String(entidad[this.metadata.Propiedades[index].Id]);
    }
    if (entidad['Id']) return entidad['Id'];
    if (entidad['id']) return entidad['id'];
    return '';
  }

  public ObtenerCampoIdEntidad(): string {
    const index = this.metadata.Propiedades.findIndex(x => x.EsIdRegistro === true);
    if (index >= 0) {
      return this.metadata.Propiedades[index].Id;
    }
    return '';
  }

  private EsPropiedadExtendida(id: string): boolean {
    const col = this.columnasBase.find(x => x.Id == id)
    if (col) {
      return col.EsPropiedadExtendida;
    }
    return false;
  }

  AlternarCheckboxes(): void {
    this.configuration.checkboxes = !this.configuration.checkboxes;
  }

}
