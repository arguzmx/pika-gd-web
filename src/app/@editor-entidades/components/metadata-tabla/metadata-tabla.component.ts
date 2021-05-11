import { CacheFiltrosBusqueda } from './../../services/cache-filtros-busqueda';
import { EntidadesService } from './../../services/entidades.service';
import { first } from 'rxjs/operators';
import { EditorEntidadesBase } from './../../model/editor-entidades-base';
import {
  Component, OnInit, Input, OnChanges, SimpleChanges,
  ViewChild, TemplateRef, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { ConfiguracionEntidad } from '../../model/configuracion-entidad';
import { ITablaMetadatos } from '../../model/i-tabla-metadatos';
import { Config, DefaultConfig, Columns, APIDefinition, API } from 'ngx-easy-table';
import { TranslateService } from '@ngx-translate/core';
import { FiltroConsulta, Operacion, Consulta, HTML_DATE, HTML_DATETIME, HTML_TIME, PropiedadesExtendidas, tTime, tDate, tDateTime, tString, PropiedadExtendida } from '../../../@pika/pika-module';
import { EntidadVinculada } from '../../../@pika/pika-module';
import { ColumnaTabla } from '../../model/columna-tabla';
import { Propiedad, MetadataInfo } from '../../../@pika/pika-module';
import { TablaEventObject } from '../../model/tabla-event-object';
import { AppLogService } from '../../../@pika/pika-module';
import { NbDialogService } from '@nebular/theme';
import { Router } from '@angular/router';
import { Traductor } from '../../services/traductor';
import { format } from 'date-fns';
import { DiccionarioNavegacion } from '../../model/i-diccionario-navegacion';
import { Acciones, HTML_CHECKBOX, HTML_NUMBER, HTML_TEXT, tBinaryData, tBoolean, tDouble, tIndexedString, tInt32, tInt64, TipoDato, tList } from '../../../@pika/metadata';


@Component({
  selector: 'ngx-metadata-tabla',
  templateUrl: './metadata-tabla.component.html',
  styleUrls: ['./metadata-tabla.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetadataTablaComponent extends EditorEntidadesBase
  implements ITablaMetadatos, OnInit, OnChanges {

  @ViewChild('table', { static: true }) table: APIDefinition;
  @ViewChild('boolTpl', { static: true }) boolTpl: TemplateRef<any>;
  @ViewChild('cataloLinkTpl', { static: true }) cataloLinkTpl: TemplateRef<any>;
  @ViewChild('fechaTpl', { static: true }) fechaTpl: TemplateRef<any>;
  @ViewChild('listTpl', { static: true }) listTpl: TemplateRef<any>;
  @ViewChild('dialogColPicker', { static: true }) dialogColPicker: TemplateRef<any>;
  private dialogColPickRef: any;


  // Parámetros de configuración
  @Input() config: ConfiguracionEntidad;
  @Input() metadata: MetadataInfo;
  @Input() busuedaPersonalizada: boolean = false;
  @Output() NuevaSeleccion = new EventEmitter();
  @Output() EditarSeleccion = new EventEmitter();
  @Output() ConteoRegistros = new EventEmitter();
  @Output() EventoResultadoBusqueda = new EventEmitter();

  // Determina si la entidad en edición se elimina de manera lógica
  public eliminarLogico: boolean = false;

  // Entidades vinculadas para la edición
  private vinculos: EntidadVinculada[] = [];

  // Define si el paginao de la entidad es relacional
  private usarPaginadoRelacional: boolean = false;

  // Datos y columnas para EasyTables en el template
  public entidadseleccionada: any = null;
  public renglonSeleccionado: number = -1;
  public configuration: Config;
  public data: any;
  public columns: Columns[] = [];
  public columnasBase: ColumnaTabla[] = [];
  public columnasExtendias: string[] = [];
  private tmpcolumnas: ColumnaTabla[] = [];
  public pagination = {
    limit: 10,
    offset: 0,
    count: -1,
    sort: '',
    order: '',
  };

  private _CerrarDialogos() {
    if (this.dialogColPickRef && !this.dialogColPickRef.closed) this.dialogColPickRef.close();
  }

  public _Reset(): void {
    this._CerrarDialogos();
    this.entidadseleccionada = null;
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
    this.consulta = {
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
  public consulta: Consulta = {
    indice: 0,
    tamano: 10,
    ord_columna: '',
    ord_direccion: '',
    recalcular_totales: true,
    consecutivo: 0,
    FiltroConsulta: [],
  };

  public T: Traductor;
  constructor(
    private cdr: ChangeDetectorRef,
    private cacheFilros: CacheFiltrosBusqueda,
    entidades: EntidadesService, translate: TranslateService,
    diccionarioNavegacion: DiccionarioNavegacion,
    applog: AppLogService, router: Router, private dialogService: NbDialogService) {
    super(entidades, applog, router, diccionarioNavegacion);
    this.T = new Traductor(translate);
  }

  ngOnChanges(changes: SimpleChanges): void {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'metadata':
            this.ProcesaConfiguracion();
            break;
        }
      }
    }
  }


  ngOnInit(): void {
    this.ConfiguraTabla();
    this.CargaTraducciones();
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
        this.obtenerPaginaDatos(false);
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
    this.T.ts = ['ui.cerrar', 'ui.selcol', 'ui.eliminar', 'ui.confirmar', 'ui.propiedades'];
    this.T.ObtenerTraducciones();
  }

  // Establece las propiedades por defecto de los metadatos
  private ProcesarMetadatos(m: MetadataInfo): MetadataInfo {
    this.usarPaginadoRelacional = false;

    // Añade propiedades de paginado relacional si viene la información del ruteo
    if (this.config.OrigenId !== '' && this.config.OrigenTipo !== '') {
      m.PaginadoRelacional = true;
    }

    // const cachekeys =  Object.keys(this.PropCache.items);
    // for ( let i = 0; i < m.Propiedades.length; i++ ) {
    //   if (cachekeys.indexOf(m.Propiedades[i].Id) >= 0 ) {
    //     m.Propiedades[i].ValorDefault = this.PropCache.get(m.Propiedades[i].Id);
    //   }
    // }

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
    this.entidadseleccionada = null;
    this.renglonSeleccionado = -1;
    this.NuevaSeleccion.emit(this.entidadseleccionada);
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

  public EtiquetasFecha(f: Date, EntidadId: string,  column: any, rowIndex: any) {

    if (!this.metadata) return '';

    const p = this.metadata.Propiedades.find(x => x.Id === EntidadId);
    let texto = '';
    if (p) {
      const c = p.AtributosVistaUI.find(x => x.Plataforma === 'web');
      if (f) {
        const fecha = new Date(f);
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
        if (columnas[i].EsFecha) template = this.fechaTpl;
        if (columnas[i].Tipo === 'bool') template = this.boolTpl;
        if (columnas[i].EsLista) template = this.listTpl;
        if (columnas[i].EsCatalogoVinculado) template = this.cataloLinkTpl;
        this.columns.push({
          key: columnas[i].Id,
          title: columnas[i].NombreI18n,
          orderEnabled: columnas[i].Ordenable,
          searchEnabled: columnas[i].Buscable,
          cellTemplate: template,
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

    const pllantillas: string[] = []

    props.Propiedades.forEach(p => {
      if (pllantillas.indexOf(p.PlantillaId) < 0) {
        pllantillas.push(p.PlantillaId);
      }
    });

    pllantillas.forEach(pid => {
      if (this.columnasExtendias.indexOf(pid) < 0) {
        props.Propiedades.forEach(p => {
          
          if (p.PlantillaId == pid) {
            
            columnas.push({
              Id: p.Id,
              Nombre: p.Nombre,
              Ordenable: true,
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
              Ordenable: true,
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
              AtributosVistaUI: [ {
                PropiedadId: p.Id,
                Control: this.ControlHTMLDePropiedadExtendida(p),
                Accion: Acciones.search,
                Plataforma: 'web'
              }],
              AtributosEvento: null,
              ValoresLista: null,
              OrdenarValoresListaPorNombre:  false,
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
            } );
          }
        });
        this.columnasExtendias.push(pid);
      }
    });


    if (columnas.length > 0) {
      columnas.forEach(c => {
        this.columnasBase.push(c);
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
    return {   Id: p.Id,
              Nombre: ""}
  }

  eventosTabla($event: { event: string; value: any }): void {
    this.LimpiarSeleccion();
    switch ($event.event) {
      case 'onOrder':
      case 'onPagination':
        this.onPagination($event);
        this.renglonSeleccionado = -1;
        this.entidadseleccionada = null;
        this.NuevaSeleccion.emit(this.entidadseleccionada);
        break;

      case 'onClick':
        this.renglonSeleccionado = $event.value.rowId;
        this.entidadseleccionada = $event.value.row;
        this.NuevaSeleccion.emit(this.entidadseleccionada);
        this.SetSeleccion(this.renglonSeleccionado);
        break;

      case 'onDoubleClick':
        this.renglonSeleccionado = $event.value.rowId;
        this.entidadseleccionada = $event.value.row;
        this.EditarSeleccion.emit(this.entidadseleccionada);
        this.SetSeleccion(this.renglonSeleccionado);
        break;
    }

  }


  ///  Inicializa las opciones para la tabla
  ConfiguraTabla(): void {
    this.configuration = { ...DefaultConfig };
    this.configuration.isLoading = false;
    this.configuration.serverPagination = true;
    this.configuration.threeWaySort = false;
    this.configuration.tableLayout.style = 'normal';
    this.configuration.tableLayout.striped = true;
    this.configuration.tableLayout.borderless = false;
    this.configuration.selectRow = false;
    this.configuration.checkboxes = false;
  }

  AlternarCheckboxes(): void {
    this.configuration.checkboxes = !this.configuration.checkboxes;
  }


  // evalua el evento de paginacdo
  private onPagination(obj: TablaEventObject): void {
    this.pagination.limit = obj.value.limit ? obj.value.limit : this.pagination.limit;
    this.pagination.offset = obj.value.page ? obj.value.page : this.pagination.offset;
    this.pagination.sort = !!obj.value.key ? obj.value.key : this.pagination.sort;
    this.pagination.order = !!obj.value.order ? obj.value.order : this.pagination.order;

    this.pagination = { ...this.pagination };

    // Id: string;
    // Elementos: Busqueda[];
    // Fecha: Date;
    // FechaFinalizado: Date;
    // Estado: EstadoBusqueda;
    // PuntoMontajeId: string;
    // indice: number;
    // tamano: number;
    // consecutivo: number;
    // ord_columna: string;
    // ord_direccion: string;
    // recalcular_totales: boolean;

    if (this.busuedaPersonalizada) {
      this.consultaPersonalizada["consecutivo"] = 0;
      this.consultaPersonalizada["indice"] = this.pagination.offset - 1;
      this.consultaPersonalizada["tamano"] = this.pagination.limit;
      this.consultaPersonalizada["ord_columna"] = this.pagination.sort;
      this.consultaPersonalizada["ord_direccion"] = this.pagination.order;
      this.obtenerPaginaDatosPersonalizada(false, this.urlPersonalizado, this.consultaPersonalizada);
      
    } else {
      this.consulta.consecutivo = 0;
      this.consulta.indice = this.pagination.offset - 1;
      this.consulta.tamano = this.pagination.limit;
      this.consulta.ord_columna = this.pagination.sort;
      this.consulta.ord_direccion = this.pagination.order;
      this.consulta = { ...this.consulta };
      this.obtenerPaginaDatos(false);
    }
  }


  // Obtiene una nueva página de datos
  public obtenerPaginaDatos(notificar: boolean): void {
    this.consulta.FiltroConsulta = this.cacheFilros.GetCacheFiltros(this.config.TransactionId);
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
            this.data = data.Elementos || [];
            this.configuration.isLoading = false;
            this.ConteoRegistros.emit(data.ConteoTotal);
            if (notificar) this.NotificarConteo(data.ConteoTotal);
          } else {
            this.ConteoRegistros.emit(0);
            this.NotificarErrorDatos(data.ConteoTotal);
          }
          this.pagination.count = data.ConteoTotal;
          this.pagination = { ...this.pagination };
          this.cdr.detectChanges();

        });
    } else {
      this.entidades.ObtenerPagina(this.config.TipoEntidad, this.consulta)
        .pipe(first())
        .subscribe(data => {

          if (data) {

            this.data = data.Elementos || [];
            this.configuration.isLoading = false;
            this.ConteoRegistros.emit(data.ConteoTotal);
            if (notificar) this.NotificarConteo(data.ConteoTotal);
          } else {
            this.NotificarErrorDatos(data.ConteoTotal);
          }


          this.pagination.count = data.ConteoTotal;
          this.pagination = { ...this.pagination };
          this.cdr.detectChanges();
        });
    }
  }


  private urlPersonalizado: string;
  private consultaPersonalizada: unknown;

  // Obtiene una nueva página de datos
  public obtenerPaginaDatosPersonalizada(notificar: boolean, path: string, consulta: unknown): void {

    this.AnularSeleccion();
    this.data = [];
    this.configuration.isLoading = true;
    if (this.columns.length > 4) {
      this.configuration.horizontalScroll = true;
    } else {
      this.configuration.horizontalScroll = false;
    }

    this.entidades.ObtenerPaginaPersonalizada(this.config.TipoEntidad, consulta, path)
      .pipe(first())
      .subscribe(data => {

        this.urlPersonalizado = path;
        this.consultaPersonalizada = consulta;

        if (data) {

          if (data.PropiedadesExtendidas.Propiedades.length > 0) {
            this.EstableceColumnasMetadatos(data.PropiedadesExtendidas);
            const elementos = [];
            data.Elementos.forEach(e => {
              const metadata = data.PropiedadesExtendidas.ValoresEntidad.find(x => x.Id == e["Id"]);
              var index = 0;
              data.PropiedadesExtendidas.Propiedades.forEach(p => {
                if (metadata) {
                  e[p.Id] = metadata.Valores[index];
                } else {
                  e[p.Id] = '';
                }
                index++;
              });
              elementos.push(e);
            });

            this.data = elementos || [];
          } else {
            this.data = data.Elementos || [];
          }

      
          this.cdr.detectChanges();
          data.Elementos = [];
          this.EventoResultadoBusqueda.emit(data);
          this.ConteoRegistros.emit(data.ConteoTotal);
          if (notificar) this.NotificarConteo(data.ConteoTotal);
          
          this.configuration.isLoading = false;
          this.cdr.detectChanges();

        } else {

          this.cdr.detectChanges();
          this.EventoResultadoBusqueda.emit(null);
          this.ConteoRegistros.emit(0);
          this.NotificarErrorDatos(data.ConteoTotal);
          this.cdr.detectChanges();
          this.configuration.isLoading = false;
        }
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

  public elementoSeleccionado(): any {
    return this.entidadseleccionada;
  }

}
