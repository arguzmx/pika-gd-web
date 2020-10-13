import { PermisoAplicacion } from './../../../@pika/seguridad/permiso-aplicacion';
import { CONTEXTO, EventosFiltrado } from './../../services/entidades.service';
import { FiltroConsulta, IProveedorReporte, TipoDespliegueVinculo } from '../../../@pika/pika-module';
import { NbDialogService } from '@nebular/theme';
import { MetadataEditorComponent } from './../metadata-editor/metadata-editor.component';
import { AppLogService } from '../../../@pika/pika-module';
import { MetadataInfo } from '../../../@pika/pika-module';
import { Component, OnInit, OnDestroy, ViewChildren, QueryList, ViewChild,
  TemplateRef, Input, OnChanges, SimpleChanges, Output, EventEmitter, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { EntidadesService } from '../../services/entidades.service';
import { Subject } from 'rxjs';
import { first } from 'rxjs/operators';
import { ConfiguracionEntidad } from '../../model/configuracion-entidad';
import { EditorEntidadesBase } from '../../model/editor-entidades-base';
import { TranslateService } from '@ngx-translate/core';
import { Operacion } from '../../../@pika/pika-module';
import { MetadataBuscadorComponent } from '../metadata-buscador/metadata-buscador.component';
import { EntidadVinculada,
  TipoCardinalidad,
} from '../../../@pika/pika-module';
import { Location } from '@angular/common';
import { Traductor } from '../../services/traductor';
import { MetadataTablaComponent } from '../metadata-tabla/metadata-tabla.component';
import { DiccionarioNavegacion } from '../../model/i-diccionario-navegacion';

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

  @ViewChildren(MetadataEditorComponent) editorMetadatos: QueryList<MetadataEditorComponent>;
  @ViewChildren(MetadataBuscadorComponent) buscadorMetadatos: QueryList<MetadataBuscadorComponent>;
  @ViewChild('dialogConfirmDelete', { static: true }) dialogConfirmDelete: TemplateRef<any>;
  @ViewChild('dialogLinkPicker', { static: true }) dialogLinks: TemplateRef<any>;
  @ViewChild('dialogReportPicker', { static: true }) dialogReportPicker: TemplateRef<any>;

  @ViewChildren(MetadataTablaComponent) tablas: QueryList<MetadataTablaComponent>;

  private dialogComnfirmDelRef: any;
  private dialogLinkPickRef: any;
  private dialogReportPickerRef: any;

  @Input() config: ConfiguracionEntidad;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setAlturaPanelLateral(event.target.innerHeight);
  }

  public alturaComponente = '500px';

  // Deternima si es factible la edición
  public editarDisponible: boolean = false;

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

  public busquedaLateral: boolean = false;

  public tieneReportes: boolean = false;

  public Permiso: PermisoAplicacion;


  // Cosntructor del componente
  constructor(
    entidades: EntidadesService,
    ts: TranslateService,
    applog: AppLogService,
    router: Router,
    private dialogService: NbDialogService,
    private location: Location,
    diccionarioNavegacion: DiccionarioNavegacion,
    ) {
    super(entidades, applog, router, diccionarioNavegacion);
    this.T  = new Traductor(ts);
    this.Permiso = this.entidades.permisoSinAcceso;
    this.setAlturaPanelLateral(window.innerHeight);
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
    this.T.ts = ['ui.actualizar', 'ui.crear', 'ui.buscar', 'ui.selcol', 'ui.reportes', 'ui.busqueda-lateral',
    'ui.borrarfiltros', 'ui.cerrar', 'ui.guardar', 'ui.editar', 'ui.eliminar', 'ui.elementoseleccionado',
    'ui.propiedades', 'ui.regresar', 'ui.eliminar-filtro', 'ui.total-regitros'];
    this.T.ObtenerTraducciones();
   }

  ngOnDestroy(): void {
    this.onDestroy$.next(null);
    this.onDestroy$.complete();
  }

  ngOnInit(): void {
    this.CargaTraducciones();
  }

private  ProcesaCambiosConfiguracion(): void {
  if (this.config && this.config.TipoEntidad)  {
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

  private  Procesaentidad() {

    this.Permiso = this.config.Permiso ? this.config.Permiso : this.entidades.permisoSinAcceso;

    const KeyNombreEntidad = ('entidades.' + this.config.TipoEntidad).toLowerCase();

    this.EliminarLogico = this.metadata.ElminarLogico ? true : false;

    this.tieneVinculos = this.metadata.EntidadesVinculadas
    && this.metadata.EntidadesVinculadas.length > 0 ? true : false;

    this.tieneReportes = (this.metadata.Reportes && this.metadata.Reportes.length > 0);

    this.entidades.SetCacheFiltros(this.config.TransactionId, this.GetFiltrosDeafault());

    // Establece entidades vinculadas
    if (this.metadata.EntidadesVinculadas) {
      this.metadata.EntidadesVinculadas.forEach( e => {
          // asigna como etiqueta del primero hijo en consideración para los links con jerarquías
          e.Etiqueta = e.EntidadHijo.split(',')[0];
          this.vinculos.push(e);
          e.EntidadHijo.split(',').forEach( entidad => {
            if (entidad) this.T.ts.push('entidades.' + entidad.toLowerCase());
          });
      });
    }

    if (this.metadata.VistasVinculadas) {
      this.metadata.VistasVinculadas.forEach( link => {
          this.T.ts.push(`vistas.${link.Vista}`);
      });
      this.tieneBotonesVista = this.metadata.VistasVinculadas.length > 0;
    }

    this.T.ObtenerTraducciones();

    this.botonesLinkVista = this.metadata.VistasVinculadas ?? [];

    this.T.translate.get([ KeyNombreEntidad ]).pipe(first())
    .subscribe( t => {
        this.NombreEntidad = this.T.ObtienePlural(t[KeyNombreEntidad]);
    });
  }

  private ProcesaConfiguracion(): void {

    // Es una entidad vinculada
    if (this.config.OrigenId !== '' && this.config.OrigenTipo !== '' ) {
      this.NombreInstanciaDisponible = false;
      this.NombreInstancia = '';
      this.MostrarRegresar = false;
      const entidad = this.entidades.GetCacheInstanciaAntidad(this.config.OrigenTipo, this.config.OrigenId);
      if (entidad) {
        this.NombreInstanciaDisponible = true;
        this.NombreInstancia = this.entidades.ObtenerNombreEntidad(this.config.OrigenTipo, entidad);
        this.MostrarRegresar = true;
        this.Procesaentidad();
      } else {
        // Si la entidad no existe obtiene los metadatos
        this.entidades
          .ObtieneMetadatos(this.config.OrigenTipo)
          .pipe(first())
          .subscribe((m) => {
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
    this.tablas.first.obtenerPaginaDatos(false);
  }

  // Recibe el evento de nueva selección desde la tabla
  public NuevaSeleccion(entidad: any) {
    this.entidad = entidad;
    this.InstanciaSeleccionada = entidad !== null ? true : false;
    this.editarDisponible = this.InstanciaSeleccionada &&
    (this.config.TipoDespliegue.toString() !== TipoDespliegueVinculo.Membresia.toString());

    this.vincularActivo = (this.InstanciaSeleccionada && this.tieneVinculos);
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
      let nombre = this.entidades.ObtenerNombreEntidad(this.config.TipoEntidad, this.entidad);
       nombre = (nombre === '') ? this.T.t['ui.elementoseleccionado'] : '\'' + nombre + '\'';
      this.T.translate.get(msg, { nombre:
        nombre})
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

    switch (this.config.TipoDespliegue.toString()) {
      case TipoDespliegueVinculo.Membresia.toString():
        this.entidades.ObtieneMetadatos(this.config.OrigenTipo).pipe(first())
        .subscribe( m => {
          const vinculo = m.EntidadesVinculadas.find(x =>
            x.EntidadHijo.toLowerCase() === this.config.TipoEntidad.toLowerCase()
            && x.TipoDespliegue === TipoDespliegueVinculo.Membresia);

          this.entidades.EliminarEntidadMiembros(this.config.TipoEntidad,
            this.entidad[vinculo.PropiedadHijo], [
            this.entidad[vinculo.PropiedadIdMiembro]]).pipe(first())
            .subscribe( resultado => {
              if (resultado) this.tablas.first.obtenerPaginaDatos(false);
            });
        });
        break;

        default:
          this.entidades.EliminarEntidad(this.config.TipoEntidad, Id, nombre)
          .pipe(first()).subscribe( resultado => {
              if (resultado) this.tablas.first.obtenerPaginaDatos(false);
          });
          break;
    }
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
    this.filtrosActivos = (conteoFiltrosDefault !== cache.length);
    this.entidades.SetCacheFiltros(this.config.TransactionId, cache);
    this.VistaTrasera = false;
    this.tablas.first.obtenerPaginaDatos(true);
  }

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

  public eliminarFiltros(): void {
    const cache: FiltroConsulta[] = (this.GetFiltrosDeafault());
    this.filtrosActivos = false;
    this.entidades.SetCacheFiltros(this.config.TransactionId, cache);
    this.tablas.first.obtenerPaginaDatos(true);
    this.entidades.EmiteEventoFiltros(EventosFiltrado.EliminarFiltros);
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

  mostrarReportes() {
    if (this.entidad) {
      this.dialogReportPickerRef = this.dialogService
      .open(this.dialogReportPicker, { context: '' });
    } else {
      this.applog.AdvertenciaT('editor-pika.mensajes.warn-sin-seleccion', null , null);
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

  const nombre =  this.entidades.ObtenerNombreEntidad(this.config.TipoEntidad, this.entidad) + '.xlsx';

    this.entidades.GetReport(this.config.TipoEntidad, reporte, nombre);
  }

}
