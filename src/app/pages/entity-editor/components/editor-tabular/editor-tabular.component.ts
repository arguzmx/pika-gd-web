import { FiltroConsulta } from './../../../../@pika/consulta/filtro-consulta';
import { NbDialogService } from '@nebular/theme';
import { MetadataEditorComponent } from './../metadata-editor/metadata-editor.component';
import { MetadataTablaComponent } from './../metadata-tabla/metadata-tabla.component';
import { AppLogService } from './../../../../@pika/servicios/app-log/app-log.service';
import { MetadataInfo } from './../../../../@pika/metadata/metadata-info';
import { PARAM_ID_ORIGEN, PARAM_TIPO_ORIGEN, PARAM_TIPO } from './../../model/constantes';
import { Component, OnInit, OnDestroy, ViewChildren, QueryList, ViewChild,
  TemplateRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { EntidadesService } from '../../services/entidades.service';
import { Subject } from 'rxjs';
import { first } from 'rxjs/operators';
import { ConfiguracionEntidad } from '../../model/configuracion-entidad';
import { EditorEntidadesBase } from '../../model/editor-entidades-base';
import { TranslateService } from '@ngx-translate/core';
import { Operacion } from '../../../../@pika/consulta';
import { MetadataBuscadorComponent } from '../metadata-buscador/metadata-buscador.component';
import { EntidadVinculada, TipoCardinalidad } from '../../../../@pika/metadata/entidad-vinculada';
import { Location } from '@angular/common';

const CONTENIDO_BUSCAR = 'buscar';
const CONTENIDO_EDITAR = 'editar';
const CONTENIDO_MOSTRAR = 'mostrar';

@Component({
  selector: 'ngx-editor-tabular',
  templateUrl: './editor-tabular.component.html',
  styleUrls: ['./editor-tabular.component.scss'],
})
export class EditorTabularComponent extends EditorEntidadesBase implements OnInit,
OnDestroy, OnChanges {
  private onDestroy$: Subject<void> = new Subject<void>();
  @ViewChildren(MetadataTablaComponent) tablas: QueryList<MetadataTablaComponent>;
  @ViewChildren(MetadataEditorComponent) editorMetadatos: QueryList<MetadataEditorComponent>;
  @ViewChildren(MetadataBuscadorComponent) buscadorMetadatos: QueryList<MetadataBuscadorComponent>;
  @ViewChild('dialogConfirmDelete', { static: true }) dialogConfirmDelete: TemplateRef<any>;
  @ViewChild('dialogLinkPicker', { static: true }) dialogLinks: TemplateRef<any>;
  private dialogComnfirmDelRef: any;
  private dialogLinkPickRef: any;

  @Input() config: ConfiguracionEntidad;

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

  // Cosntructor del componente
  constructor(
    entidades: EntidadesService,
    ts: TranslateService,
    applog: AppLogService,
    private router: Router,
    private dialogService: NbDialogService,
    private location: Location,
    ) {
    super(entidades, ts, applog);
   }


  private _CerrarDialogos() {
    if (this.dialogComnfirmDelRef) this.dialogComnfirmDelRef.close();
    if (this.dialogLinkPickRef) this.dialogLinkPickRef.close();
  }


  public regresar() {
    this.location.back();
  }

  private _Reset(): void {
      this._CerrarDialogos();
      this.InstanciaSeleccionada = false;
      this.metadata = null;
      this.entidad = null;
      this.totalRegistros = 0;
      this.filtrosActivos = false;
      this.EliminarLogico = false;
      this.NombreInstanciaDisponible = false;
      this.NombreEntidad = '';
      this.NombreInstancia = '';
      this.vincularActivo = false;
      this.tieneVinculos = false;
      this.vinculos = [];
      this.EtiequetaTarjetaTrasera = '';
      this.ContenidoTarjetaTrasera = '';
      this.VistaTrasera = false;
      this.MostrarRegresar = false;
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

   private CargaTraducciones() {
    this.ts = ['ui.actualizar', 'ui.crear', 'ui.buscar', 'ui.selcol',
    'ui.borrarfiltros', 'ui.cerrar', 'ui.guardar', 'ui.editar', 'ui.eliminar',
    'ui.propiedades', 'ui.regresar', 'ui.eliminar-filtro', 'ui.total-regitros'];
    this.ObtenerTraducciones();
   }

  ngOnDestroy(): void {
    this.onDestroy$.next(null);
    this.onDestroy$.complete();
  }

  ngOnInit(): void {
    this.CargaTraducciones();
  }

private  ProcesaCambiosConfiguracion(): void {
  if (this.config.TipoEntidad)  {
    this._Reset();
    this.entidades.ObtieneMetadatos(this.config.TipoEntidad)
    .pipe(first())
    .subscribe( m => {
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
    return filtros;
  }

  private ProcesaConfiguracion(): void {

    if (this.config.OrigenId !== '' && this.config.OrigenTipo !== '' ) {
      this.NombreInstanciaDisponible = false;
      this.NombreInstancia = '';
      this.MostrarRegresar = false;
      const entidad = this.entidades.GetCacheInstanciaAntidad(this.config.OrigenTipo, this.config.OrigenId);
      if (entidad) {
        this.NombreInstanciaDisponible = true;
        this.NombreInstancia = this.entidades.ObtenerNombreEntidad(this.config.OrigenTipo, entidad);
        this.MostrarRegresar = true;
      }
    }
    const KeyNombreEntidad = ('entidades.' + this.config.TipoEntidad).toLocaleLowerCase();
    this.EliminarLogico = this.metadata.ElminarLogico ? true : false;
    this.tieneVinculos = this.metadata.EntidadesVinculadas
    && this.metadata.EntidadesVinculadas.length > 0 ? true : false;

    this.entidades.SetCacheFiltros(this.config.TransactionId, this.GetFiltrosDeafault());
    if (this.metadata.EntidadesVinculadas) {
      this.metadata.EntidadesVinculadas.forEach( e => {
          this.vinculos.push(e);
          this.ts.push('entidades.' + e.EntidadHijo.toLowerCase());
      });
    }
    this.ObtenerTraducciones();
    this.translate.get([ KeyNombreEntidad ]).pipe(first())
    .subscribe( t => {
        this.NombreEntidad = this.ObtienePlural(t[KeyNombreEntidad]);
    });
  }

  // recibe el evento de nueva entidad desde el editor
  public NuevaEntidad(entidad: any) {
    this.tablas.first.LimpiarSeleccion();
    this.tablas.first.obtenerPaginaDatos(false);
  }

  // Recibe el evento de nueva selección desde la tabla
  public NuevaSeleccion(entidad: any) {
    this.entidad = entidad;
    this.InstanciaSeleccionada = entidad !== null ? true : false;
    this.vincularActivo = this.InstanciaSeleccionada && this.tieneVinculos;
  }

  public EntidadActualizada(entidad: any) {
    this.tablas.first.LimpiarSeleccion();
    this.tablas.first.obtenerPaginaDatos(false);
  }

  public CapturaFinalizada() {
    this.OcultarTarjetaTrasera();
  }


  public refrescarTabla(): void {
    this.tablas.first.obtenerPaginaDatos(false);
  }

  public mostrarVinculos(): void {
    this.dialogLinkPickRef = this.dialogService
    .open(this.dialogLinks, { context: '' });
  }

  linkUnoAVarios(link: EntidadVinculada) {
    return (link.Cardinalidad === TipoCardinalidad.UnoVarios) ? true : false;
  }


  IrALink(link: EntidadVinculada): void {
    this.CerrarDialogos();

    if (this.entidad) {
        const Id = this.entidades.ObtenerIdEntidad (this.config.TipoEntidad, this.entidad);
        if (Id) {

          this.entidades.SetCacheInstanciaEntidad(this.config.TipoEntidad, Id, this.entidad);

          this.tablas.first._Reset();
          this._Reset();
          // tslint:disable-next-line: max-line-length
          const url = `/pages/tabular?${PARAM_TIPO}=${link.EntidadHijo}&${PARAM_TIPO_ORIGEN}=${this.config.TipoEntidad}&${PARAM_ID_ORIGEN}=${Id}`;
          this.router.navigateByUrl(url);

        } else {
          this.applog.FallaT('editor-pika.mensajes.err-id-vinculo', null , null);
        }
    } else {
      this.applog.AdvertenciaT('editor-pika.mensajes.warn-sin-seleccion', null , null);
    }
  }

  CerrarDialogos(): void {

  }

  public mostrarCrear(): void {
    this.InstanciaSeleccionada = false;
    this.entidad = null;
    this.MostrarTarjetaTrasera('editar');
  }

  private MostrarTarjetaTrasera(op: string) {
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
      if (this.InstanciaSeleccionada) {
        this.MostrarTarjetaTrasera('editar');
      } else {
        this.applog.AdvertenciaT('editor-pika.mensajes.warn-sin-seleccion', null , null);
      }
  }

  public eliminarEntidades(): void {
    if (this.InstanciaSeleccionada) {
      this.ConfirmarEliminarEntidades();
    } else {
      this.applog.AdvertenciaT('editor-pika.mensajes.warn-sin-seleccion', null , null);
    }
  }

  public ConfirmarEliminarEntidades(): void {
    const msg = this.metadata.ElminarLogico ?
      'editor-pika.mensajes.warn-crud-eliminar-logico' : 'editor-pika.mensajes.warn-crud-eliminar';
      this.translate.get(msg, { nombre:
        this.entidades.ObtenerNombreEntidad(this.config.TipoEntidad, this.entidad) })
        .pipe(first())
      .subscribe( m =>  {
        this.dialogComnfirmDelRef = this.dialogService
        .open(this.dialogConfirmDelete, { context: m });
      });
  }

  // LLamdado desde el dialogo de confirmación en el teplate
  private eliminarSeleccionados() {
    this.dialogComnfirmDelRef.close();
    const Id  = this.entidades.ObtenerIdEntidad(this.config.TipoEntidad, this.entidad);
    const nombre = this.entidades.ObtenerNombreEntidad(this.config.TipoEntidad, this.entidad);
    this.entidades.EliminarEntidad(this.config.TipoEntidad, Id, nombre)
    .pipe(first()).subscribe( resultado => {
        if (resultado) this.tablas.first.obtenerPaginaDatos(false);
    });
  }

  public EventoFiltrar(filtros: FiltroConsulta[]) {
    const cache: FiltroConsulta[] = [];
    let conteoFiltrosDefault: number = 0;
    const defaults: FiltroConsulta[] = this.GetFiltrosDeafault();
    filtros.forEach ( f => {
        if (f.Valido) {
          defaults.forEach( fd => {
            if (fd === f) {
              conteoFiltrosDefault ++;
            }
          });
          cache.push(f);
        }
    });
    this.filtrosActivos = (conteoFiltrosDefault !== defaults.length);
    this.entidades.SetCacheFiltros(this.config.TransactionId, cache);
    this.VistaTrasera = false;
    this.tablas.first.obtenerPaginaDatos(true);
  }


  public ConteoRegistros(total: number): void {
      this.totalRegistros = total;
  }

  public mostrarBuscar(): void {
    this.MostrarTarjetaTrasera('buscar');
  }

  public mostrarSelectorColumnas(): void {
    this.tablas.first.MostrarSelectorColumnas();
  }

  public eliminarFiltros(): void {
    const cache: FiltroConsulta[] = (this.GetFiltrosDeafault());
    this.filtrosActivos = false;
    this.entidades.SetCacheFiltros(this.config.TransactionId, cache);
    this.tablas.first.obtenerPaginaDatos(true);
  }


  public borrarFiltrosBuscador(): void {
    this.buscadorMetadatos.first.borrarFiltrosBuscador();
  }

  private FiltroEliminadas(): FiltroConsulta {
    return  {
          Negacion: false, Operador: Operacion.OP_EQ,
          ValorString: 'false', Propiedad: 'Eliminada', Id: 'Eliminada',
          Valor: [false],
        };
  }


}
