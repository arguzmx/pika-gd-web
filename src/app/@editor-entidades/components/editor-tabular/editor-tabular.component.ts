import { AppEventBus } from './../../../@pika/state/app-event-bus';
import { LinkContenidoGenericoComponent } from './../link-contenido-generico/link-contenido-generico.component';
import { CacheFiltrosBusqueda } from './../../services/cache-filtros-busqueda';
import { PermisoAplicacion } from './../../../@pika/seguridad/permiso-aplicacion';
import { CONTEXTO, EventosFiltrado } from './../../services/entidades.service';
import { FiltroConsulta, IProveedorReporte, LinkVista, TipoDespliegueVinculo } from '../../../@pika/pika-module';
import { NbDialogService, NbDialogRef, NbSelectComponent, NbButtonModule, NbButtonComponent } from '@nebular/theme';
import { MetadataEditorComponent } from './../metadata-editor/metadata-editor.component';
import { MetadataInfo } from '../../../@pika/pika-module';
import {
  Component, OnInit, OnDestroy, ViewChildren, QueryList, ViewChild,
  TemplateRef, Input, OnChanges, SimpleChanges, Output, EventEmitter, HostListener, ViewContainerRef, ComponentFactoryResolver, ComponentFactory, ComponentRef, ChangeDetectionStrategy, ChangeDetectorRef, AfterViewInit
} from '@angular/core';
import { Router } from '@angular/router';
import { EntidadesService } from '../../services/entidades.service';
import { first } from 'rxjs/operators';
import { ConfiguracionEntidad } from '../../model/configuracion-entidad';
import { EditorEntidadesBase } from '../../model/editor-entidades-base';
import { TranslateService } from '@ngx-translate/core';
import { Operacion } from '../../../@pika/pika-module';
import { MetadataBuscadorComponent } from '../metadata-buscador/metadata-buscador.component';
import {
  EntidadVinculada,
  TipoCardinalidad,
} from '../../../@pika/pika-module';
import { Location } from '@angular/common';
import { Traductor } from '../../services/traductor';
import { MetadataTablaComponent } from '../metadata-tabla/metadata-tabla.component';
import { DiccionarioNavegacion } from '../../model/i-diccionario-navegacion';
import { TipoVista, ValorListaOrdenada } from '../../../@pika/metadata';
import { EventoAplicacion, PayloadItem } from '../../../@pika/eventos/evento-aplicacion';
import { EditorTemasSeleccionComponent } from '../editor-temas-seleccion/editor-temas-seleccion.component';
import { ConfirmacionComponent } from '../confirmacion/confirmacion.component';
import { AppLogService } from '../../../services/app-log/app-log.service';
import { FormBuilder } from '@angular/forms';
import { MapaDialogos } from '../../../services/dialogos-dinamicos/mapa-dialogos';
import { MatButton } from '@angular/material/button';

const CONTENIDO_BUSCAR = 'buscar';
const CONTENIDO_EDITAR = 'editar';
const CONTENIDO_MOSTRAR = 'mostrar';
const EMPTYGUID = '00000000-0000-0000-0000-000000000000';

@Component({
  selector: 'ngx-editor-tabular',
  templateUrl: './editor-tabular.component.html',
  styleUrls: ['./editor-tabular.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditorTabularComponent extends EditorEntidadesBase implements OnInit,
  OnDestroy, OnChanges, AfterViewInit {
  @ViewChildren(MetadataEditorComponent) editorMetadatos: QueryList<MetadataEditorComponent>;
  @ViewChildren(MetadataBuscadorComponent) buscadorMetadatos: QueryList<MetadataBuscadorComponent>;
  @ViewChild('dialogConfirmDelete', { static: true }) dialogConfirmDelete: TemplateRef<any>;
  @ViewChild('dialogLinkPicker', { static: true }) dialogLinks: TemplateRef<any>;
  @ViewChild('dialogReportPicker', { static: true }) dialogReportPicker: TemplateRef<any>;
  @ViewChild('dialogVistaCommando', { static: true }) dialogVistaCommando: TemplateRef<any>;
  @ViewChild("dynDialog", { read: ViewContainerRef }) dynDialogRef;
  @ViewChild("dialogVistaCommandoContainer", { read: ViewContainerRef }) containerVistaComando;
  @ViewChild('dialogoTemasSeleccion', { static: true }) dialogoTemasSeleccion: TemplateRef<any>;
  @ViewChildren(MetadataTablaComponent) tablas: QueryList<MetadataTablaComponent>;
  @ViewChild('listaTemas', { static: true }) listaTemas: NbSelectComponent;
  
  private dialogComnfirmDelRef: any;
  private dialogLinkPickRef: any;
  private dialogReportPickerRef: any;
  private dialogCommandRef: NbDialogRef<any>;
  private dialogoTemasSeleccionRef: NbDialogRef<any>;
  private seleccionMultiple: boolean = false;

  @Input() config: ConfiguracionEntidad;
  @Input() mostrarBarra: boolean = true;
  @Input() busuedaPersonalizada: boolean = false;
  @Output() eventoConteoRegistros = new EventEmitter();
  @Output() EventoResultadoBusqueda = new EventEmitter();
  @Output() EventNuevaSeleccion = new EventEmitter();

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setAlturaPanelLateral(event.target.innerHeight);
  }

  componenteLinkContenidoGenerico(id: string, tipo: string) {
    this.containerVistaComando.clear();
    const componentFactory = this.resolver.resolveComponentFactory(LinkContenidoGenericoComponent);
    const component: ComponentRef<LinkContenidoGenericoComponent> = this.containerVistaComando.createComponent(componentFactory);
    component.instance.id = id;
    component.instance.tipo = tipo;
  }

  accent: string = "info";
  public alturaComponente = '500px';

  // Deternima si es factible la edición
  public editarDisponible: boolean = false;
  // Determina si la entidad acepta búsquedas de texto
  public BuscarPorTexto: boolean = false;
  // Determina si es posible elminar todo slos elementos de la tabla
  public PermisoEliminarTodo: boolean = false;
  // Nombre del tipo de entidad en edición
  public NombreEntidad: string = '';
  // Nombre de la instancia de entidad en edición
  public NombreInstancia: string = '';
  // Define si la entidad puede vinucularse
  public vincularActivo: boolean = false;
  // Define si la entidad tiene vinculos para asignar
  public tieneVinculos: boolean = false;
  // Lista de entidades vinculadas
  public vinculos: EntidadVinculada[] = [];
  public vinculosActivos: EntidadVinculada[] = [];
  // Texto a mostrar en la tarjeta trasera
  public EtiequetaTarjetaTrasera: string = '';
  // Tipo de contenido de la tarjeta trasera
  public ContenidoTarjetaTrasera: string = '';
  // Especifica si la vista de tarjeta trasera esta activa
  public VistaTrasera: boolean = false;
  // Especifica si el botón para regrear se encuentra activo
  public MostrarRegresar: boolean = false;
  // Especifica si existe un nombre para mostrar de istancie en el caso de datos relacionados
  public NombreInstanciaDisponible: boolean = false;
  // Especifica si existe una instancia seleccioanda para las operaciones de edición
  public InstanciaSeleccionada: boolean = false;

  // Determina si la eliminación de la entidad es de tipo lógico
  public EliminarLogico: boolean = false;

  // Determina si existen filtro diferentes a los por defaul activos
  public filtrosActivos: boolean = false;

  // mantiene el total de registros encontrados en la busqueda
  public totalRegistros: number = 0;

  /// Entidad seleccioanda desde la tabla
  public entidad: any = null;

  public metadata: MetadataInfo;

  public busquedaLateral: boolean = false;

  public tieneReportes: boolean = false;

  public Permiso: PermisoAplicacion;

  // Determina si la entidad puede almacenar selecciones del usuario
  public HabilitarSeleccion: boolean = false;
  public temas: ValorListaOrdenada[] = [];

  // Entidad padre del contenido tabular
  public EntidadPadre : any = null;

  public barraEntidades: boolean = true;
  public barraSeleccion: boolean = false;
  public idSeleccion: string = null;

  // Cosntructor del componente
  constructor(
    private cdr: ChangeDetectorRef,
    appeventBus: AppEventBus,
    private cacheFiltros: CacheFiltrosBusqueda,
    entidades: EntidadesService,
    ts: TranslateService,
    applog: AppLogService,
    router: Router,
    private resolver: ComponentFactoryResolver,
    private dialogService: NbDialogService,
    private location: Location,
    fb: FormBuilder,
    diccionarioNavegacion: DiccionarioNavegacion,
  ) {
    super(fb, appeventBus, entidades, applog, router, diccionarioNavegacion);
    this.T = new Traductor(ts);
    this.Permiso = this.entidades.permisoSinAcceso;
    this.setAlturaPanelLateral(window.innerHeight);
  }
  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  private setAlturaPanelLateral(altura: number) {
    let h = parseInt(altura.toString(), 0) - 250;
    h = h < 0 ? 200 : h;
    const a = `${h}px`;
    this.alturaComponente = a;
  }

  private _CerrarDialogos() {
    if (this.dialogComnfirmDelRef) this.dialogComnfirmDelRef.close();
    if (this.dialogLinkPickRef) this.dialogLinkPickRef.close();
  }

  public ResultadoBusquedaHandler(data: unknown) {
    this.EventoResultadoBusqueda.emit(data);
  }

  public regresar() {
    this.location.back();
  }

  public mostrarBuscarLateral() {
    this.busquedaLateral = !this.busquedaLateral;
    if (this.busquedaLateral) {

    } else {
      this.OcultarTarjetaTrasera();
    }
  }

  public _Reset(): void {
    if (this.tablas && this.tablas.first) this.tablas.first._Reset();
    this.Permiso = this.entidades.permisoSinAcceso;
    this._CerrarDialogos();
    this.busquedaLateral = false;
    this.BuscarPorTexto = false;
    this.textoBusqueda = '';
    this.tieneReportes = false;
    this.InstanciaSeleccionada = false;
    this.editarDisponible = false;
    this.configTmp = null;
    this.metadata = null;
    this.metadataTmp = null;
    this.entidad = null;
    this.entidadTmp = null;
    this.totalRegistros = 0;
    this.filtrosActivos = false;
    this.EliminarLogico = false;
    this.NombreInstanciaDisponible = false;
    this.NombreEntidad = '';
    this.NombreInstancia = '';
    this.vincularActivo = false;
    this.tieneVinculos = false;
    this.vinculos = [];
    this.vinculosActivos = [];
    this.EtiequetaTarjetaTrasera = '';
    this.ContenidoTarjetaTrasera = '';
    this.VistaTrasera = false;
    this.MostrarRegresar = false;
    this.HabilitarSeleccion = false;
    this.temas = [];
    this.barraEntidades = true;
    this.barraSeleccion = false;
    this.idSeleccion = null;
    this.EntidadPadre = null;
    this.menus =[];
    this.tieneMenus = false;
    this.tieneBotonesFiltro = false;
    this.botonesFiltro =[];
    this.botonesFiltroActivos = [];
  }

  ngOnChanges(changes: SimpleChanges): void {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'config':
            this.ProcesaCambiosConfiguracion();
            break;
        }
      }
    }
  }


  private setBarras( entidades:boolean, seleccion: boolean ) {
    this.barraEntidades = entidades;
    this.barraSeleccion = seleccion;
  }

  private CargaTraducciones() {
    this.T.ts = ['ui.actualizar', 'ui.crear', 'ui.buscar', 'ui.selcol', 'ui.reportes', 'ui.busqueda-lateral',
      'ui.borrarfiltros', 'ui.cerrar', 'ui.guardar', 'ui.editar', 'ui.eliminar', 'ui.elementoseleccionado',
      'ui.propiedades', 'ui.regresar', 'ui.eliminar-filtro', 'ui.total-regitros', 'ui.alternar-selector-checkbox',
      'ui.seleccionados', 'ui.eliminar-todo',
      'ui.seleccionados-mostrar',
      'ui.seleccionados-adicionar',
      'ui.seleccionados-eliminar',
      'ui.seleccionados-vaciar',
      'entidades.temas-seleccion', 'ui.seleccionados-eliminar',
      'ui.seleccionados-temas', 'entidades.eliminar-seleccion',
      'entidades.temas-seleccion-nombre','entidades.borrar-seleccion',
      'ui.vaciar', 'entidades.vaciar-seleccion','editor-pika.mensajes.warn-sin-seleccion-tema'];
    this.T.ObtenerTraducciones();
  }

  ngOnDestroy(): void {
    this.onDestroy$.next(null);
    this.onDestroy$.complete();
  }

  ngOnInit(): void {
    this.CargaTraducciones();
  }

  private ProcesaCambiosConfiguracion(): void {
    if (this.config && this.config.TipoEntidad) {
      this._Reset();
      this.accent = this.mostrarBarra ? 'info' : 'basic';
      this.entidades.ObtieneMetadatos(this.config.TipoEntidad, this.config.OrigenTipo)
        .pipe(first())
        .subscribe(m => {
          this.metadata = m;
          this.ProcesaConfiguracion();
        });
    }
  }

  private GetFiltrosDeafault(): FiltroConsulta[] {
    const filtros: FiltroConsulta[] = [];
    if (this.EliminarLogico) {
      filtros.push(this.FiltroEliminadas());
    }
    // this.metadata.Propiedades.forEach((p) => {
    //   if (p.IdContextual) {
    //     const partes = p.IdContextual.split('.');
    //     const valor = this.entidades.GetPropiedadCacheContextual(
    //       partes[1],
    //       partes[0],
    //       '',
    //     );
    //     filtros.push(this.FiltroEq(p.Id, valor, true));
    //   }
    // });
    return filtros;
  }

  private FiltroEq(propiedad: string, valor: any, Oculto?: boolean): FiltroConsulta {
    return {
      Negacion: false,
      Operador: Operacion.OP_EQ,
      ValorString: String(valor),
      Propiedad: propiedad,
      Id: propiedad,
      Valor: [valor],
      Oculto: Oculto
    };
  }

  private Procesaentidad() {
    if(this.metadata) {
      this.PermisoEliminarTodo = this.metadata.PermiteEliminarTodo;
      this.BuscarPorTexto = this.metadata.BuscarPorTexto;
      if(this.BuscarPorTexto) {
        this.hookTypeAhead();
      }
    }

    this.Permiso = this.config.Permiso ? this.config.Permiso : this.entidades.permisoSinAcceso;

    const KeyNombreEntidad = ('entidades.' + this.config.TipoEntidad).toLowerCase();

    this.EliminarLogico = this.metadata.ElminarLogico ? true : false;
    this.HabilitarSeleccion = this.metadata.HabilitarSeleccion;
    this.tieneVinculos = this.metadata.EntidadesVinculadas
      && this.metadata.EntidadesVinculadas.length > 0 ? true : false;

    this.tieneReportes = (this.metadata.Reportes && this.metadata.Reportes.length > 0);

    this.cacheFiltros.SetCacheFiltros(this.config.TransactionId, this.GetFiltrosDeafault());

    // Establece entidades vinculadas
    if (this.metadata.EntidadesVinculadas) {
      this.metadata.EntidadesVinculadas.forEach(e => {
        // asigna como sta del primero hijo en consideración para los links con jerarquías
        e.Etiqueta = e.EntidadHijo.split(',')[0];
        if (e.FiltroUI === '') {
          e.Activo = true;
        } else {
          e.Activo = false;
        }
        this.vinculos.push(e);
        e.EntidadHijo.split(',').forEach(entidad => {
          if (entidad) this.T.ts.push('entidades.' + entidad.toLowerCase());
        });
      });
      this.vinculosActivos = this.vinculos;
    }

    if (this.metadata.VistasVinculadas) {
      this.metadata.VistasVinculadas.forEach(link => {
        this.T.ts.push(`vistas.${link.Vista}`);
      });
      this.tieneBotonesVista = this.metadata.VistasVinculadas.length > 0;
    }

    if(this.metadata.VistasVinculadas) {
      this.botonesLinkVista = this.metadata.VistasVinculadas.filter(x => x.Tipo != TipoVista.WebFilter && ( x.MenuId == null || x.MenuId == '') ) ?? [];
      this.botonesFiltro = this.metadata.VistasVinculadas.filter(x => x.Tipo == TipoVista.WebFilter && ( x.MenuId == null || x.MenuId == '') ) ?? [];
    } else {
      this.botonesLinkVista = [];
      this.botonesFiltro = [];
    }

    if(this.metadata.Menus) {

      this.tieneMenus = this.metadata.Menus.length > 0;
      const menus = this.metadata.Menus.sort((a, b) => b.MenuIndex-a.MenuIndex);
      menus.forEach(m => {
        this.T.ts.push(`vistas.${m.Titulo}`);
        m.Links = this.metadata.VistasVinculadas.filter(v => v.MenuId == m.MenuId).sort((a, b) => b.MenuIndex-a.MenuIndex);
      });
      this.menus = menus;
    }


    this.T.ObtenerTraducciones();

    this.T.translate.get([KeyNombreEntidad]).pipe(first())
      .subscribe(t => {
        this.NombreEntidad = this.T.ObtienePlural(t[KeyNombreEntidad]);
      });
  }

  menuItems(MenuId): LinkVista[] {
    const m = this.menus.find(m=>m.MenuId ==MenuId);
    const Items = {...m.Links};
    return Items;
  } 

  public establecerFiltro(link: LinkVista) {
    this.AlternarFiltro(link);
    this.cdr.detectChanges();
  }

  private ProcesaConfiguracion(): void {
    // Es una entidad vinculada
    if (this.config.OrigenId !== '' && this.config.OrigenTipo !== '') {
      this.NombreInstanciaDisponible = false;
      this.NombreInstancia = '';
      this.MostrarRegresar = false;
      this.EntidadPadre = this.entidades.GetCacheInstanciaAntidad(this.config.OrigenTipo, this.config.OrigenId);
      if (this.EntidadPadre) {
        this.NombreInstanciaDisponible = true;
        this.NombreInstancia = this.entidades.ObtenerNombreEntidad(this.config.OrigenTipo, this.EntidadPadre);
        this.MostrarRegresar = true;
        this.Procesaentidad();
      } else {
        // Si la entidad no existe obtiene los metadatos
        this.entidades
          .ObtieneMetadatos(this.config.OrigenTipo, '')
          .pipe(first())
          .subscribe((m) => {
            this.HabilitarSeleccion = m.HabilitarSeleccion;
            this.entidades
              .ObtieneEntidadUnica(
                this.config.OrigenTipo,
                this.config.OrigenId,
              )
              .pipe(first())
              .subscribe((e) => {
                // Y posteriormente una instancia en base al ID
                // para establecer los títulos
                if (e) {
                  this.EntidadPadre = e;
                  this.entidades.SetCacheInstanciaEntidad(this.config.OrigenTipo, this.config.OrigenId, e);
                  this.NombreInstanciaDisponible = true;
                  this.NombreInstancia = this.entidades.ObtenerNombreEntidad(
                    this.config.OrigenTipo,
                    e,
                  );
                  this.MostrarRegresar = true;
                  this.Procesaentidad();
                }
              });
          });
      }
    } else {
      this.Procesaentidad();
    }

  }

  // recibe el evento de nueva entidad desde el editor
  public NuevaEntidad(entidad: any) {
    this.tablas.first.LimpiarSeleccion();
    this.tablas.first.obtenerPaginaDatos(false, true);
  }

  public NuevaSeleccionMultiple(entidad: unknown[]) { 
    this.editarDisponible = false;
    this.InstanciaSeleccionada = entidad.length > 0;
  }

  // Recibe el evento de nueva selección desde la tabla
  public NuevaSeleccion(entidad: unknown) {
    this.entidad = entidad;
    this.InstanciaSeleccionada = entidad !== null ? true : false;
    this.editarDisponible = this.InstanciaSeleccionada &&
      (this.config.TipoDespliegue.toString() !== TipoDespliegueVinculo.Membresia.toString());

    const tmp: EntidadVinculada[] = [];

    if (entidad != null) {
      this.vinculos.forEach(v => {
        if (v.FiltroUI === '') {
          tmp.push(v);
        } else {
          const exp = v.FiltroUI.replace(/\[/g, 'entidad[');
          const vv = { ...v };
          vv.Activo = eval(exp);
          if (vv.Activo) {
            tmp.push(vv);
          }
        }
      });
    }

    this.vinculosActivos = tmp;
    this.vincularActivo = (this.InstanciaSeleccionada && this.tieneVinculos && (this.vinculosActivos.length > 0));

    this.EventNuevaSeleccion.emit(entidad);
  }

  public EntidadActualizada(entidad: any) {
    this.tablas.first.LimpiarSeleccion();
    this.tablas.first.obtenerPaginaDatos(false, false);
  }

  public CapturaFinalizada() {
    this.OcultarTarjetaTrasera();
  }


  public refrescarTabla(): void {
    this.tablas.first.obtenerPaginaDatos(false, false);
  }

  public mostrarVinculos(): void {
    if (this.vincularActivo) {
      this.dialogLinkPickRef = this.dialogService
        .open(this.dialogLinks, { context: '' });
    }
  }

  linkUnoAVarios(link: EntidadVinculada) {
    return (link.Cardinalidad === TipoCardinalidad.UnoVarios) ? true : false;
  }


  public EjecutarIrALink(link: EntidadVinculada) {
    this.IrALink(link, this.entidad, this.config);
  }

  CerrarDialogos(): void {
    if (this.dialogComnfirmDelRef) this.dialogComnfirmDelRef.close();
    if (this.dialogLinkPickRef) this.dialogLinkPickRef.close();
  }

  public mostrarCrear(): void {
    this.EditandoVinculada = false;
    this.InstanciaSeleccionada = false;
    this.entidad = null;
    this.MostrarTarjetaTrasera('editar');
  }

  public MostrarTarjetaTrasera(op: string) {
    this.ContenidoTarjetaTrasera = op;
    this.VistaTrasera = true;
  }

  private OcultarTarjetaTrasera() {
    this.ContenidoTarjetaTrasera = '';
    this.VistaTrasera = false;
  }

  public EditarSeleccion(entidad): void {
    this.InstanciaSeleccionada = true;
    this.entidad = entidad;
    this.MostrarTarjetaTrasera('editar');
  }

  public mostrarEditar(): void {
    this.EditandoVinculada = false;
    if (this.InstanciaSeleccionada) {
      this.MostrarTarjetaTrasera('editar');
    } else {
      this.applog.AdvertenciaT('editor-pika.mensajes.warn-sin-seleccion', null, null);
    }
  }

  public eliminarTodoEntidades(): void {
    this.ConfirmarEliminarTodoEntidades();
  }

  public ConfirmarEliminarTodoEntidades(): void {
    this.TipoEliminacion  = this.ELIMINAR_TODOSVINCULADOS;
    const msg ='editor-pika.mensajes.warn-crud-eliminar-todos';
    this.T.translate.get(msg)
      .pipe(first())
      .subscribe(m => {
        this.dialogComnfirmDelRef = this.dialogService
          .open(this.dialogConfirmDelete, { context: m });
      });
  }


  public eliminarEntidades(): void {
    if( 
        (this.seleccionMultiple  && this.tablas.first.ObtieneIdsSeleccionados().length > 0 ) ||  
        (this.InstanciaSeleccionada && !this.seleccionMultiple)
      ) {
        this.ConfirmarEliminarEntidades();
    } else {
      this.applog.AdvertenciaT('editor-pika.mensajes.warn-sin-seleccion', null, null);
    }
  }

  public ConfirmarEliminarEntidades(): void {

    let nombre = '';
    if(this.seleccionMultiple) {
      nombre = this.tablas.first.ObtieneIdsSeleccionados().length + ' elementos seleccionados' ;
    } else {
      nombre = this.entidades.ObtenerNombreEntidad(this.config.TipoEntidad, this.entidad);
      nombre = (nombre === '') ? this.T.t['ui.elementoseleccionado'] : '\'' + nombre + '\'';
    }

    this.TipoEliminacion  = this.ELIMINAR_SELECCION;
    const msg = this.metadata.ElminarLogico ?
      'editor-pika.mensajes.warn-crud-eliminar-logico' : 'editor-pika.mensajes.warn-crud-eliminar';
    this.T.translate.get(msg, {
      nombre:
        nombre
    })
      .pipe(first())
      .subscribe(m => {
        this.dialogComnfirmDelRef = this.dialogService
          .open(this.dialogConfirmDelete, { context: m });
      });
  }
  
  private TipoEliminacion: string ='';
  private ELIMINAR_SELECCION  = 'seleccion';
  private ELIMINAR_TODOSVINCULADOS  = 'todosvinculados';

  seleccionarEliminacion() {
    switch(this.TipoEliminacion){
      case this.ELIMINAR_SELECCION:
        this.eliminarSeleccionados();
        break;

      case this.ELIMINAR_TODOSVINCULADOS:
        this.eliminarTodosVinculados();
        break;
    }
    this.TipoEliminacion  = '';
  }


  private eliminarTodosVinculados() {
    this.dialogComnfirmDelRef.close();

    this.entidades.DeleteTodosVinculados(this.config.OrigenId, this.config.TipoEntidad)
    .pipe(first()).subscribe(resultado => {
      if (resultado) this.tablas.first.obtenerPaginaDatos(false, true);
    });

  }

  // LLamdado desde el dialogo de confirmación en el teplate
  private eliminarSeleccionados() {
    this.dialogComnfirmDelRef.close();

    let Id: string = '';
    let ids: string[] = [];
    let nombre: string = '';
    if(this.seleccionMultiple) {
      ids = this.tablas.first.ObtieneIdsSeleccionados();
      nombre = this.tablas.first.ObtieneIdsSeleccionados().length + ' elementos';
    } else {
      Id = this.entidades.ObtenerIdEntidad(this.config.TipoEntidad, this.entidad);
      nombre = this.entidades.ObtenerNombreEntidad(this.config.TipoEntidad, this.entidad)  
    }
    

    switch (this.config.TipoDespliegue.toString()) {
      case TipoDespliegueVinculo.Membresia.toString():
        this.entidades.ObtieneMetadatos(this.config.OrigenTipo, '').pipe(first())
          .subscribe(m => {
            const vinculo = m.EntidadesVinculadas.find(x =>
              x.EntidadHijo.toLowerCase() === this.config.TipoEntidad.toLowerCase()
              && x.TipoDespliegue === TipoDespliegueVinculo.Membresia);

            this.entidades.EliminarEntidadMiembros(this.config.TipoEntidad,
              this.entidad[vinculo.PropiedadHijo], [
              this.entidad[vinculo.PropiedadIdMiembro]]).pipe(first())
              .subscribe(resultado => {
                if (resultado) this.tablas.first.obtenerPaginaDatos(false, true);
              });
          });
        break;

      default:
        if(this.seleccionMultiple) {
          this.entidades.EliminarEntidadMultiple(this.config.TipoEntidad, ids, nombre)
          .pipe(first()).subscribe(resultado => {
            if (resultado) this.tablas.first.obtenerPaginaDatos(false, true);
          });
        } else {
          this.entidades.EliminarEntidad(this.config.TipoEntidad, Id, nombre)
          .pipe(first()).subscribe(resultado => {
            if (resultado) this.tablas.first.obtenerPaginaDatos(false, true);
          });
        }
        break;
    }
  }


  public AplicarFiltros(filtros: FiltroConsulta[]) {
    const cache: FiltroConsulta[] = [];
    let conteoFiltrosDefault: number = 0;
    const defaults: FiltroConsulta[] = this.GetFiltrosDeafault();
    filtros.forEach(f => {
      if (f.Valido) {
        defaults.forEach(fd => {
          if (fd === f) {
            conteoFiltrosDefault++;
          }
        });
        cache.push(f);
      }
    });

    const filtrosActivos: FiltroConsulta[] = [];
    this.botonesFiltroActivos.forEach(f=> {
      filtrosActivos.push( {Negacion: false,  Propiedad: f.Vista, Operador: Operacion.OP_EQ, Valor: [ "true" ], ValorString: "true", Valido: true});
    });

    if(filtrosActivos.length > 0) {
      filtrosActivos.forEach(f=> {
        cache.push({...f});
      });
    }

    this.filtrosActivos = (conteoFiltrosDefault !== cache.length);
    this.cacheFiltros.SetCacheFiltros(this.config.TransactionId, cache);
    this.VistaTrasera = false;
    this.tablas.first.obtenerPaginaDatos(true, true);
  }

  // public EventoFiltrar(filtros: FiltroConsulta[]) {
  //   const cache: FiltroConsulta[] = [];
  //   let conteoFiltrosDefault: number = 0;
  //   const defaults: FiltroConsulta[] = this.GetFiltrosDeafault();
  //   filtros.forEach(f => {
  //     if (f.Valido) {
  //       defaults.forEach(fd => {
  //         if (fd === f) {
  //           conteoFiltrosDefault++;
  //         }
  //       });
  //       cache.push(f);
  //     }
  //   });

  //   const filtrosActivos: FiltroConsulta[] = [];
  //   this.botonesFiltroActivos.forEach(f=> {
  //     filtrosActivos.push( {Negacion: false,  Propiedad: f.Vista, Operador: Operacion.OP_EQ, Valor: [ "true" ], ValorString: "true", Valido: true});
  //   });

  //   if(filtrosActivos.length > 0) {
  //     filtrosActivos.forEach(f=> {
  //       cache.push({...f});
  //     });
  //   }

  //   this.filtrosActivos = (conteoFiltrosDefault !== cache.length);
  //   this.cacheFiltros.SetCacheFiltros(this.config.TransactionId, cache);
  //   this.VistaTrasera = false;
  //   this.tablas.first.obtenerPaginaDatos(true, true);
  // }

  public ConteoRegistros(total: number): void {
    this.totalRegistros = total;
  }

  public mostrarBuscar(): void {
    if (this.busquedaLateral) {

    } else {
      this.MostrarTarjetaTrasera('buscar');
    }
  }

  public mostrarSelectorColumnas(): void {
    this.tablas.first.MostrarSelectorColumnas();
  }

  public EliminarFiltros(): void {
    const cache: FiltroConsulta[] = (this.GetFiltrosDeafault());
    this.BorrarFIltros();
    this.filtrosActivos = false;
    this.cacheFiltros.SetCacheFiltros(this.config.TransactionId, cache);
    this.tablas.first.obtenerPaginaDatos(true, true);
    this.entidades.EmiteEventoFiltros(EventosFiltrado.EliminarFiltros);
  }


  public borrarFiltrosBuscador(): void {
    this.buscadorMetadatos.first.borrarFiltrosBuscador();
  }

  private FiltroEliminadas(): FiltroConsulta {
    return {
      Negacion: false, Operador: Operacion.OP_EQ,
      ValorString: 'false', Propiedad: 'Eliminada', Id: 'Eliminada',
      Valor: [false],
    };
  }

  mostrarReportes() {
    if (this.entidad) {
      this.dialogReportPickerRef = this.dialogService
        .open(this.dialogReportPicker, { context: '' });
    } else {
      this.applog.AdvertenciaT('editor-pika.mensajes.warn-sin-seleccion', null, null);
    }
  }

  EjecutarIrReporte(reporte: IProveedorReporte) {

    this.dialogReportPickerRef.close();

    const parametros = reporte.Parametros;
    parametros.forEach(p => {
      if (p.Contextual) {
        const partes = p.IdContextual.split('.');
        switch (partes[0].toUpperCase()) {
          case CONTEXTO:
            p['Valor'] = this.entidad[partes[1]];
            break;
        }
      }
    });

    const nombre = reporte.Nombre + ' ' +
      this.entidades.ObtenerNombreEntidad(this.config.TipoEntidad, this.entidad) +
      '.' + reporte.FormatosDisponibles[0].Id;
    this.entidades.GetReport(this.config.TipoEntidad, reporte, nombre);
  }

  public obtenerPaginaDatosPersonalizada(notificar: boolean, path: string, consulta: unknown): void {
    this.tablas.first.obtenerPaginaDatosPersonalizada(notificar, path, consulta);
  }

  public navegarVistaPoTag(tag: string,parametros: Map<string, string>, newWindow: boolean = false) {
    const link = this.botonesLinkVista.find(x => x.Vista == tag);
    if (link) {
      this.procesaNavegarVista(link, parametros, newWindow);
    }
  }

  private NavegarVistaComando(link: LinkVista, newWindow: boolean) {
    switch (link.Vista) {
      case "crearcontenidoactivo":
        this.ComandoContenidoVinculado(link, true);
        break;
    }
  }


  private ComandoContenidoVinculado(link: LinkVista, newWindow: boolean) {
    this.dialogService
      .open(LinkContenidoGenericoComponent, { context: { id: this.entidad['Id'], tipo: this.metadata.Tipo } })
      .onClose.subscribe(e => {
        if (e != null) {
          const payload: PayloadItem[] = [];
          payload.push({ id: 'Id', valor: e['Id'], valores: [] });
          payload.push({ id: 'Nombre', valor: e['Nombre'], valores: [] });
          payload.push({ id: 'VolumenId', valor: e['VolumenId'], valores: [] });
          payload.push({ id: 'VersionId', valor: e['VersionId'], valores: [] });
          payload.push({ id: 'PuntoMontajeId', valor: e['PuntoMontajeId'], valores: [] });
          payload.push({ id: 'TipoOrigenId', valor: '', valores: [] });
          payload.push({ id: 'CarpetaId', valor: e['CarpetaId'], valores: [] });
          payload.push({ id: 'OrigenId', valor: '', valores: [] });

          const evento: EventoAplicacion = {
            id: e['Id'], tema: 'visorcontenido', payload: payload
          };
          this.ejecutaVavegarContenidoVinculado(evento);
        }
      });
  }


  public procesaNavegarVista(link: LinkVista, parametros: Map<string, string>, newWindow: boolean = false) {
    
    const registrosSeleccionados = this.tablas.first.ObtieneEntidadesSeleccionadas();
    
    if (link.RequiereSeleccion) {
      if (registrosSeleccionados.length > 0) {
        switch (link.Tipo) {
          case TipoVista.Vista:
            this.ejecutaNavegarVista(this.metadata.Tipo, link, this.entidad, this.metadata, parametros, newWindow);
            break;

          case TipoVista.Comando:
            this.NavegarVistaComando(link, newWindow);
            break;

          case TipoVista.EventoApp:
            this.ejecutaNavegarAppEvento(this.metadata.Tipo, link, this.entidad, this.metadata, parametros);
            break;

          case  TipoVista.WebCommand:
            const validar = link.Condicion.replace(/entidad/g,'this.entidad').replace(/padre/,'this.EntidadPadre');

            if (validar!=''){
              try {
                const valido = eval(validar);
                if (!valido){
                  this.applog.AdvertenciaT(
                    'editor-pika.mensajes.warn-condicion-link',
                    null,
                    null,
                  );
                    return;
                }  
              }
              catch(e){
                this.applog.FallaT(
                  'editor-pika.mensajes.err-eval-condicion-link',
                  null,
                  null,
                );
              }
            }

            const vista = `vistas.${link.Vista}`;
            let nombre = '';
            if (registrosSeleccionados.length == 1) {
              // A veece sl nombre no ecist epor ejemplo cuando se obtiene de un Id vinculado
              nombre = this.entidades.ObtenerNombreEntidad(this.config.TipoEntidad, registrosSeleccionados[0] );
            }

            let Titulo = vista;
            let Cuerpo = `${vista}-conf`;

            if(registrosSeleccionados.length > 1){
              Cuerpo = `${vista}-conf-n`
            }

            this.T.ObtenerTraduccion([Titulo, Cuerpo], { tema: nombre, conteo: registrosSeleccionados.length} ).pipe(first()).subscribe(t=> {
              const c = MapaDialogos.get(link.Vista);
              this.dialogService
                .open(c, {
                  context: {
                    titulo: t[Titulo],
                    entidades: this.entidades,
                    metadata: this.metadata,
                    texto: t[Cuerpo] 
                  }
                })
                .onClose.subscribe(confirmacion => {
                 if((typeof confirmacion) == 'boolean') {
                    if(confirmacion){
                      this.ejecutaNavegarWebCommand(link, registrosSeleccionados, this.metadata);
                    }
                 } else {
                    if (confirmacion['Ok']) {
                      this.ejecutaNavegarWebCommand(link, registrosSeleccionados, this.metadata, confirmacion['Payload']);
                    }
                 }
                });
            });
            break;
        }

      } else {
        this.applog.AdvertenciaT(
          'editor-pika.mensajes.warn-sin-seleccion',
          null,
          null,
        );
      }
    } else {
      // Sólo aplica para navegación jerárquica
    }
  }


  AlternatCheckboxes() {
    this.seleccionMultiple = !this.seleccionMultiple;
    this.tablas.first.AlternarCheckboxes();
  }


  seleccionAdicionar() {
    const seleccion = this.tablas.first.ObtieneIdsSeleccionados();
    if (seleccion.length > 0) {
      this.AdicionarATema(seleccion);
    } else {
      this.applog.AdvertenciaT('editor-pika.mensajes.warn-sin-seleccion', null, null);
    }
  }


  AdicionarATema(ids: string[]) {
    this.dialogService
      .open(EditorTemasSeleccionComponent, { 
        context: {
        entidades: this.entidades,
        metadata: this.metadata
      } })
      .onClose.subscribe(data=> {
        if(data!=null){
          this.AdicionaSeleccion(data, ids);
        } else {
          this.applog.AdvertenciaT('editor-pika.mensajes.warn-sin-teme', null, null);
        }
      });
  }


  private AdicionaSeleccion(temaId: string, ids: string[]) {
    this.entidades.SeleccionAdicionar(temaId, ids, this.metadata.Tipo).pipe(first())
    .subscribe(resp => {

    })
  }

  ocultarSeleccion() {
    this.setBarras(true, false);
    this.ObtieneTemas();
    this.idSeleccion = null;
  }

  seleccionMostrar() {
    this.setBarras(false, true);
    this.ObtieneTemas();
    this.idSeleccion = EMPTYGUID;
  }
  
  private ObtieneTemas() {
    this.temas = [];
    this.entidades.TemaSeleccionObtener(this.metadata.Tipo).pipe(first())
    .subscribe( resultado => {
      this.temas = resultado;
    }, (err)=> {});
  }

  cambioSeleccion(id) {
    // this.idSeleccion = id;
  }

  seleccionElminar() {
    if (this.idSeleccion != EMPTYGUID) {
      const ids = this.tablas.first.ObtieneIdsSeleccionados();
      if (ids.length > 0) {
        this.dialogService
          .open(ConfirmacionComponent, {
            context: {
              entidades: this.entidades,
              metadata: this.metadata,
              texto: this.T.t['entidades.borrar-seleccion']
            }
          })
          .onClose.subscribe(confirmacion => {
            if (confirmacion) {
              this.entidades.SeleccionEliminar(this.idSeleccion, this.metadata.Tipo, ids).pipe(first())
                .subscribe(eliminada => {
                  if (eliminada) {
                    this.tablas.first.GetDataPage(true, true);
                  }
                });
            }
          });
      } else {
        this.applog.AdvertenciaT('editor-pika.mensajes.warn-sin-seleccion', null, null);
      }
    } else {
      this.applog.AdvertenciaT('editor-pika.mensajes.warn-sin-seleccion-tema', null, null);
    }
  }

  seleccionVaciar() {
    if(this.idSeleccion != EMPTYGUID) {
      this.dialogService
      .open(ConfirmacionComponent, { 
        context: {
        entidades: this.entidades,
        metadata: this.metadata,
        texto: this.T.t['entidades.vaciar-seleccion']
      } })
      .onClose.subscribe(confirmado=> {
        if (confirmado) {
          this.entidades.SeleccionVaciar(this.idSeleccion , this.metadata.Tipo).pipe(first())
          .subscribe(eliminada => {
              if (eliminada) {
                this.tablas.first.GetDataPage(true, true);
              }
          });
        }
      });
    } else {
      this.applog.AdvertenciaT('editor-pika.mensajes.warn-sin-seleccion-tema', null, null);
    }
  }

  TemaEliminar() {
    if(this.idSeleccion != EMPTYGUID) {
      this.dialogService
      .open(ConfirmacionComponent, { 
        context: {
        entidades: this.entidades,
        metadata: this.metadata,
        texto: this.T.t['entidades.eliminar-seleccion']
      } })
      .onClose.subscribe(confirmado=> {
        if (confirmado) {
          this.entidades.TemaEliminar(this.idSeleccion , this.metadata.Tipo).pipe(first())
          .subscribe(eliminada => {
              if (eliminada) {
                const idx = this.temas.findIndex(x=>x.Id == this.idSeleccion);
                this.temas.splice(idx, 1);
                this.entidades.SeleccionActualizaCache(this.temas, this.metadata.Tipo);
                this.idSeleccion = EMPTYGUID;
              }
          });
        }
      });
    } else {
      this.applog.AdvertenciaT('editor-pika.mensajes.warn-sin-seleccion-tema', null, null);
    }
  }

  

}
