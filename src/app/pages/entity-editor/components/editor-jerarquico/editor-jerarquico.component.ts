import { ConfiguracionEntidad } from './../../model/configuracion-entidad';
import { EntidadesService, CONTEXTO } from './../../services/entidades.service';
import {
  Component,
  OnInit,
  Input,
  OnDestroy,
  ViewChildren,
  ViewChild,
  OnChanges,
  QueryList,
  TemplateRef,
  SimpleChanges,
} from '@angular/core';
import { ConfiguracionEntidadJerarquica } from '../../model/configuracion-entidad-jerarquica';
import { MetadataTablaComponent } from '../metadata-tabla/metadata-tabla.component';
import { Subject, forkJoin } from 'rxjs';
import { MetadataBuscadorComponent } from '../metadata-buscador/metadata-buscador.component';
import {
  EntidadVinculada,
  TipoCardinalidad,
} from '../../../../@pika/metadata/entidad-vinculada';
import { MetadataInfo } from '../../../../@pika/metadata';
import { TranslateService } from '@ngx-translate/core';
import { AppLogService } from '../../../../@pika/servicios/app-log/app-log.service';
import { Router } from '@angular/router';
import { NbDialogService } from '@nebular/theme';
import { first } from 'rxjs/operators';
import { FiltroConsulta, Operacion } from '../../../../@pika/consulta';
import {
  PARAM_TIPO,
  PARAM_TIPO_ORIGEN,
  PARAM_ID_ORIGEN,
} from '../../model/constantes';
import { EditorEntidadesBase } from '../../model/editor-entidades-base';
import { Location } from '@angular/common';
import { EventosArbol } from '../../../../@pika/metadata/atributo-evento';
import { DynamicFlatNode } from '../editor-arbol-entidad/dynamic-database';
import { MetadataEditorComponent } from '../metadata-editor/metadata-editor.component';

const CONTENIDO_BUSCAR = 'buscar';
const CONTENIDO_EDITAR = 'editar';
const CONTENIDO_MOSTRAR = 'mostrar';

const SELECCION_NINGUNA = '';
const SELECCION_JERARQUIA = 'J';
const SELECCION_TABULAR = 'T';

@Component({
  selector: 'ngx-editor-jerarquico',
  templateUrl: './editor-jerarquico.component.html',
  styleUrls: ['./editor-jerarquico.component.scss'],
})
export class EditorJerarquicoComponent extends EditorEntidadesBase
  implements OnInit, OnDestroy, OnChanges {
  @Input() config: ConfiguracionEntidadJerarquica;
  // config: ConfiguracionEntidad;
  configJ: ConfiguracionEntidad;
  configC: ConfiguracionEntidad;
  private onDestroy$: Subject<void> = new Subject<void>();
  @ViewChildren(MetadataTablaComponent) tablas: QueryList<
    MetadataTablaComponent
  >;
  @ViewChildren(MetadataEditorComponent) editorMetadatos: QueryList<
    MetadataEditorComponent
  >;
  @ViewChildren(MetadataBuscadorComponent) buscadorMetadatos: QueryList<
    MetadataBuscadorComponent
  >;
  @ViewChild('dialogConfirmDelete', { static: true })
  dialogConfirmDelete: TemplateRef<any>;
  @ViewChild('dialogLinkPicker', { static: true }) dialogLinks: TemplateRef<
    any
  >;
  private dialogComnfirmDelRef: any;
  private dialogLinkPickRef: any;

  // Nombre del tipo de entidad en edición
  public NombreEntidad: string = '';
  // Nombre de la instancia de entidad en edición
  public NombreInstancia: string = '';
  // Define si la entidad tabular puede vinucularse
  public vincularActivoC: boolean = false;
  // Define si la entidad tablular tiene vinculos para asignar
  public tieneVinculosC: boolean = false;
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
  public InstanciaSeleccionadaC: boolean = false;

  // Especifica si existe una instancia seleccioanda para las operaciones de edición
  public InstanciaSeleccionadaJ: boolean = false;

  // Determina si la eliminación de la entidad es de tipo lógico
  public EliminarLogico: boolean = false;

  // Determina si existen filtro diferentes a los por defaul activos
  public filtrosActivos: boolean = false;

  // mantiene el total de registros encontrados en la busqueda
  public totalRegistros: number = 0;

  /// Entidad seleccioanda desde jerarquía
  public entidadJ: any = null;

  // Entidad seleccionada desde la tabla
  public entidadC: any = null;

  // Metadatos para el contenido Jerárquico
  public metadataJ: MetadataInfo;

  // Metadatos para el contenido Tabular
  public metadataC: MetadataInfo;

  // Metadatos para la entidad padre vinculada
  public metadataLink: MetadataInfo;

  // Entidad padre vinculada
  public entidadLink: any;

  public editandoJerarquica: boolean = true;

  public NodoArbolSeleccionado: DynamicFlatNode = null;

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
    this.InstanciaSeleccionadaJ = false;
    this.InstanciaSeleccionadaC = false;
    this.metadataJ = null;
    this.metadataC = null;
    this.metadataLink = null;
    this.entidadJ = null;
    this.entidadC = null;
    this.totalRegistros = 0;
    this.filtrosActivos = false;
    this.EliminarLogico = false;
    this.NombreInstanciaDisponible = false;
    this.NombreEntidad = '';
    this.NombreInstancia = '';
    this.vincularActivoC = false;
    this.tieneVinculosC = false;
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
    this.ts = [
      'ui.actualizar',
      'ui.crear',
      'ui.raizcrear',
      'ui.buscar',
      'ui.selcol',
      'ui.borrarfiltros',
      'ui.cerrar',
      'ui.guardar',
      'ui.editar',
      'ui.eliminar',
      'ui.propiedades',
      'ui.regresar',
      'ui.eliminar-filtro',
      'ui.total-regitros',
      'ui.nodocrear',
      'ui.tabularcrear',
    ];
    this.ObtenerTraducciones();
  }

  ngOnDestroy(): void {
    this.onDestroy$.next(null);
    this.onDestroy$.complete();
  }

  ngOnInit(): void {
    this.CargaTraducciones();
  }

  private ProcesaCambiosConfiguracion(): void {
    if (this.config.ConfiguracionJerarquia.TipoEntidad) {
      this.configJ = this.config.ConfiguracionJerarquia;
      this.configC = this.config.ConfiguracionContenido;
      this._Reset();

      const mJ = this.entidades
      .ObtieneMetadatos(this.configJ.TipoEntidad)
      .pipe(first());

      const mC = this.entidades
      .ObtieneMetadatos(this.configC.TipoEntidad)
      .pipe(first());

      forkJoin([mJ, mC]).subscribe( resultados => {
        this.metadataJ = resultados[0];
        this.metadataC = resultados[1];
        this.ProcesaConfiguracion();
      } );
    }
  }

  // Se llama desde el evento de seleccion de nodo enel arbol
  public NodoSeleccionado(nodo: DynamicFlatNode) {
    let refrescar = true;
    if (this.NodoArbolSeleccionado) {
      if (this.NodoArbolSeleccionado.id === nodo.id) {
        refrescar = false;
      }
    }

    this.InstanciaSeleccionadaJ = true;
    this.NodoArbolSeleccionado = nodo;

    if (refrescar) {
      this.entidades.SetCachePropiedadContextual(
        'PadreId',
        CONTEXTO,
        '',
        nodo.id,
      );
      this.tablas.first.LimpiarSeleccion();
      this.eliminarFiltros();
    }
  }

  private EstableceTituloParaEntidad() {
    if (this.configJ.OrigenId !== '' && this.configJ.OrigenTipo !== '') {
      const entidad = this.entidades.GetCacheInstanciaAntidad(
        this.configJ.OrigenTipo,
        this.configJ.OrigenId,
      );
      if (entidad) {
        this.NombreInstanciaDisponible = true;
        this.NombreInstancia = this.entidades.ObtenerNombreEntidad(
          this.configJ.OrigenTipo,
          entidad,
        );
        this.MostrarRegresar = true;
      } else {

        this.entidades
          .ObtieneMetadatos(this.configJ.OrigenTipo)
          .pipe(first())
          .subscribe((m) => {
            this.metadataLink = m;
            this.entidades
              .ObtieneEntidadUnica(
                this.configJ.OrigenTipo,
                this.configJ.OrigenId,
              )
              .pipe(first())
              .subscribe((e) => {
                this.entidadLink = e;
                this.NombreInstanciaDisponible = true;
                this.NombreInstancia = this.entidades.ObtenerNombreEntidad(
                  this.configJ.OrigenTipo,
                  this.entidadLink,
                );
              });
          });
      }
    }
  }

  private ProcesaConfiguracion(): void {
    this.NombreInstanciaDisponible = false;
    this.NombreInstancia = '';
    this.MostrarRegresar = false;

    this.EstableceTituloParaEntidad();


    this.EliminarLogico = this.metadataJ.ElminarLogico ? true : false;

    this.tieneVinculosC =
      this.metadataC.EntidadesVinculadas &&
      this.metadataC.EntidadesVinculadas.length > 0
        ? true
        : false;

    this.entidades.SetCacheFiltros(
      this.configC.TransactionId,
      this.GetFiltrosDeafault(),
    );

    const KeyNombreEntidadJ = ('entidades.' + this.configJ.TipoEntidad).toLowerCase();
    const KeyNombreEntidadC = ('entidades.' + this.configC.TipoEntidad).toLowerCase();
    this.ts.push(KeyNombreEntidadC);
    this.ts.push(KeyNombreEntidadJ);
    if (this.metadataJ.EntidadesVinculadas) {
      this.metadataJ.EntidadesVinculadas.forEach((e) => {
        this.vinculos.push(e);
        this.ts.push('entidades.' + e.EntidadHijo.toLowerCase());
      });
    }
    this.ObtenerTraducciones();
    this.translate
      .get([KeyNombreEntidadJ])
      .pipe(first())
      .subscribe((t) => {
        this.NombreEntidad = this.ObtieneSingular(t[KeyNombreEntidadJ]);
      });
  }

  private GetFiltrosDeafault(): FiltroConsulta[] {
    const filtros: FiltroConsulta[] = [];
    if (this.EliminarLogico) {
      filtros.push(this.FiltroEliminadas());
    }
    this.metadataC.Propiedades.forEach((p) => {
      if (p.IdContextual) {
        const partes = p.IdContextual.split('.');
        const valor = this.entidades.GetPropiedadCacheContextual(
          partes[1],
          partes[0],
          '',
        );
        filtros.push(this.FiltroEq(p.Id, valor));
      }
    });

    return filtros;
  }

  private FiltroEq(propiedad: string, valor: any): FiltroConsulta {
    return {
      Negacion: false,
      Operador: Operacion.OP_EQ,
      ValorString: String(valor),
      Propiedad: propiedad,
      Id: propiedad,
      Valor: [valor],
    };
  }

  // recibe el evento de nueva entidad jerárquica  desde el editor
  public NuevaEntidadJ(entidad: any) {
    const tipo =
      entidad['EsRaiz'] === true
        ? EventosArbol.CrearRaiz
        : EventosArbol.CrearHijo;
    const nodopadre =
      entidad['EsRaiz'] === true ? null : this.NodoArbolSeleccionado;
    this.entidades.EmiteEventoArbol({
      Origen: nodopadre,
      Valor: entidad,
      Evento: tipo,
      Transaccion: '',
    });
  }

  // recibe el evento de nueva entidad tabular desde el editor
  public NuevaEntidadC(entidad: any) {
    this.RemoverSeleccionC();
    this.tablas.first.LimpiarSeleccion();
    this.tablas.first.obtenerPaginaDatos(false);
  }

  // recibe el evento de entidad actualizada par la jerquia
  // en el caso de la jeraquía es necexairo un get extra
  // para obtener el valor del nodo jerarquico
  public EntidadActualizadaJ(entidad: any) {
    this.entidades
      .ObtenerEntidadUnica(
        this.configJ.TipoEntidad,
        this.NodoArbolSeleccionado.id,
      )
      .pipe(first())
      .subscribe((actualizada) => {
        this.entidades.EmiteEventoArbol({
          Origen: this.NodoArbolSeleccionado,
          Valor: actualizada,
          Evento: EventosArbol.ActualizarTextoNodo,
          Transaccion: '',
        });
      });
  }

  public EntidadActualizadaC(entidad: any) {
    this.RemoverSeleccionC();
    this.tablas.first.LimpiarSeleccion();
    this.tablas.first.obtenerPaginaDatos(false);
  }

  // La captura de la entidad jerarquica ha finalizado
  public CapturaFinalizadaJ() {
    this.OcultarTarjetaTrasera();
  }

  // La captura de la entidad taular ha finalizado
  public CapturaFinalizadaC() {
    this.OcultarTarjetaTrasera();
  }

  public refrescarTabla(): void {
    this.RemoverSeleccionC();
    this.tablas.first.obtenerPaginaDatos(false);
  }

  public mostrarVinculos(): void {
    this.dialogLinkPickRef = this.dialogService.open(this.dialogLinks, {
      context: '',
    });
  }

  linkUnoAVarios(link: EntidadVinculada) {
    return link.Cardinalidad === TipoCardinalidad.UnoVarios ? true : false;
  }

  IrALink(link: EntidadVinculada): void {
    this.CerrarDialogos();
    if (this.entidadC) {
      const Id = this.entidades.ObtenerIdEntidad(
        this.configC.TipoEntidad,
        this.entidadC,
      );
      if (Id) {
        this.entidades.SetCacheInstanciaEntidad(
          this.configC.TipoEntidad,
          Id,
          this.entidadC,
        );

        this.tablas.first._Reset();
        this._Reset();
        // tslint:disable-next-line: max-line-length
        const url = `/pages/tabular?${PARAM_TIPO}=${link.EntidadHijo}&${PARAM_TIPO_ORIGEN}=${this.configC.TipoEntidad}&${PARAM_ID_ORIGEN}=${Id}`;
        this.router.navigateByUrl(url);
      } else {
        this.applog.FallaT('editor-pika.mensajes.err-id-vinculo', null, null);
      }
    } else {
      this.applog.AdvertenciaT(
        'editor-pika.mensajes.warn-sin-seleccion',
        null,
        null,
      );
    }
  }

  CerrarDialogos(): void {}

  public mostrarCrearJerarquia(raiz: boolean): void {
    this.MostrarTituloCrear(this.configJ);
    this.editandoJerarquica = true;
    this.entidades.SetCachePropiedadContextual('EsRaiz', CONTEXTO, '', raiz);
    this.MostrarTarjetaTrasera('editar');
  }

  public mostrarCrearContenido(): void {
    this.MostrarTituloCrear(this.configC);
    this.editandoJerarquica = false;
    this.InstanciaSeleccionadaC = false;
    this.entidadC = null;
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

  public EditarSeleccionC(entidad): void {
    this.entidadC = entidad;
    if (entidad != null) {
      this.InstanciaSeleccionadaC = true;
      this.MostrarTarjetaTrasera('editar');
    } else {
      this.InstanciaSeleccionadaC = false;
    }
  }

  // Recibe el evento de nueva selección desde la tabla
  public NuevaSeleccionC(entidad: any) {
    this.entidadC = entidad;
    if (entidad != null) {
      this.InstanciaSeleccionadaC = true;
      this.vincularActivoC = this.InstanciaSeleccionadaC && this.tieneVinculosC;
    } else {
      this.InstanciaSeleccionadaC = false;
    }
  }

  // CRUD de entidades jerarquicas
  public mostrarEditarT(): void {
    if (this.InstanciaSeleccionadaJ) {
      this.entidades
        .ObtenerEntidadUnica(
          this.configJ.TipoEntidad,
          this.NodoArbolSeleccionado.id,
        )
        .pipe(first())
        .subscribe((entidad) => {
          this.MostrarTituloEditar(
            this.entidades.ObtenerNombreEntidad(
              this.configJ.TipoEntidad,
              entidad,
            ),
          );
          this.editandoJerarquica = true;
          this.entidadJ = entidad;
          this.MostrarTarjetaTrasera('editar');
        });
    } else {
      this.applog.AdvertenciaT(
        'editor-pika.mensajes.warn-sin-seleccion',
        null,
        null,
      );
    }
  }

  public eliminarEntidadesJ(): void {
    if (this.InstanciaSeleccionadaJ) {
      this.ConfirmarEliminarEntidadesJ();
    } else {
      this.applog.AdvertenciaT(
        'editor-pika.mensajes.warn-sin-seleccion',
        null,
        null,
      );
    }
  }

  public ConfirmarEliminarEntidadesJ(): void {
    this.editandoJerarquica = true;
    const msg = this.metadataJ.ElminarLogico
      ? 'editor-pika.mensajes.warn-crud-eliminar-logico'
      : 'editor-pika.mensajes.warn-crud-eliminar';
    this.translate
      .get(msg, { nombre: this.NodoArbolSeleccionado.texto })
      .pipe(first())
      .subscribe((m) => {
        this.dialogComnfirmDelRef = this.dialogService.open(
          this.dialogConfirmDelete,
          { context: m },
        );
      });
  }

  private EliminarJerarquia() {
    this.dialogComnfirmDelRef.close();
    const Id = this.NodoArbolSeleccionado.id;
    const nombre = this.NodoArbolSeleccionado.texto;
    this.entidades
      .EliminarEntidad(this.configJ.TipoEntidad, Id, nombre)
      .pipe(first())
      .subscribe((resultado) => {
        this.NodoArbolSeleccionado = null;
        this.InstanciaSeleccionadaJ = false;
        this.entidades.EmiteEventoArbol({
          Origen: this.NodoArbolSeleccionado,
          Valor: null,
          Evento: EventosArbol.EliminarNodo,
          Transaccion: '',
        });
      });
  }

  // CRUD de entidades jerarquicas
  // -------------------------------

  // CRUD de entidades tabulares

  private MostrarTituloEditar(nombre: string) {
    this.EtiequetaTarjetaTrasera = this.t['ui.editar'] + `: ${nombre}`;
  }

  private MostrarTituloCrear(config: ConfiguracionEntidad) {
    this.EtiequetaTarjetaTrasera =
      this.t['ui.crear'] + `: ${this.ObtieneNombreSingularEntidad(config)}`;
  }

  private MostrarTituloBuscar(config: ConfiguracionEntidad) {
    this.EtiequetaTarjetaTrasera =
      this.t['ui.buscar'] + `: ${this.ObtieneNombreSingularEntidad(config)}`;
  }


  private ObtieneNombreSingularEntidad(config: ConfiguracionEntidad): string {
    const KeyNombreEntidad = ('entidades.' + config.TipoEntidad).toLowerCase();
    return this.ObtieneSingular(this.t[KeyNombreEntidad]);
  }

  public mostrarEditarC(): void {
    if (this.InstanciaSeleccionadaC) {
      this.MostrarTituloEditar(
        this.entidades.ObtenerNombreEntidad(
          this.configC.TipoEntidad,
          this.entidadC,
        ),
      );
      this.editandoJerarquica = false;
      this.MostrarTarjetaTrasera('editar');
    } else {
      this.applog.AdvertenciaT(
        'editor-pika.mensajes.warn-sin-seleccion',
        null,
        null,
      );
    }
  }

  public eliminarEntidadesC(): void {
    if (this.InstanciaSeleccionadaC) {
      this.ConfirmarEliminarEntidadesC();
    } else {
      this.applog.AdvertenciaT(
        'editor-pika.mensajes.warn-sin-seleccion',
        null,
        null,
      );
    }
  }

  public ConfirmarEliminarEntidadesC(): void {
    this.editandoJerarquica = false;
    const msg = this.metadataC.ElminarLogico
      ? 'editor-pika.mensajes.warn-crud-eliminar-logico'
      : 'editor-pika.mensajes.warn-crud-eliminar';
    this.translate
      .get(msg, {
        nombre: this.entidades.ObtenerNombreEntidad(
          this.configC.TipoEntidad,
          this.entidadC,
        ),
      })
      .pipe(first())
      .subscribe((m) => {
        this.dialogComnfirmDelRef = this.dialogService.open(
          this.dialogConfirmDelete,
          { context: m },
        );
      });
  }

  private EliminarContenido() {
    this.dialogComnfirmDelRef.close();
    const Id = this.entidades.ObtenerIdEntidad(
      this.configC.TipoEntidad,
      this.entidadC,
    );
    const nombre = this.entidades.ObtenerNombreEntidad(
      this.configC.TipoEntidad,
      this.entidadC,
    );
    this.entidades
      .EliminarEntidad(this.configC.TipoEntidad, Id, nombre)
      .pipe(first())
      .subscribe((resultado) => {
        if (resultado) {
          this.RemoverSeleccionC();
          this.tablas.first.obtenerPaginaDatos(false);
        }
      });
  }

  private RemoverSeleccionC(): void {
    this.InstanciaSeleccionadaC = false;
    this.entidadC = null;
  }

  // CRUD de entidades tabulares
  // -------------------------------

  // LLamdado desde el dialogo de confirmación en el teplate
  private eliminarSeleccionados() {
    if (this.editandoJerarquica) {
      this.EliminarJerarquia();
    } else {
      this.EliminarContenido();
    }
  }

  public EventoFiltrar(filtros: FiltroConsulta[]) {
    const cache: FiltroConsulta[] = [];
    let conteoFiltrosDefault: number = 0;
    const defaults: FiltroConsulta[] = this.GetFiltrosDeafault();
    filtros.forEach((f) => {
      if (f.Valido) {
        defaults.forEach((fd) => {
          if (fd === f) {
            conteoFiltrosDefault++;
          }
        });
        cache.push(f);
      }
    });
    this.RemoverSeleccionC();
    this.filtrosActivos = conteoFiltrosDefault !== defaults.length;
    this.entidades.SetCacheFiltros(this.configC.TransactionId, cache);
    this.VistaTrasera = false;
    this.tablas.first.obtenerPaginaDatos(true);
  }

  public ConteoRegistrosC(total: number): void {
    this.totalRegistros = total;
  }

  public mostrarBuscar(): void {
    this.MostrarTituloBuscar(this.configC);
    this.MostrarTarjetaTrasera('buscar');
  }

  public mostrarSelectorColumnas(): void {
    this.tablas.first.MostrarSelectorColumnas();
  }

  public eliminarFiltros(): void {
    const cache: FiltroConsulta[] = this.GetFiltrosDeafault();
    this.RemoverSeleccionC();
    if (this.InstanciaSeleccionadaJ) {
      this.entidades.SetCachePropiedadContextual(
        'PadreId',
        CONTEXTO,
        '',
        this.NodoArbolSeleccionado.id,
      );
    }
    this.filtrosActivos = false;
    this.entidades.SetCacheFiltros(this.configC.TransactionId, cache);
    this.tablas.first.obtenerPaginaDatos(true);
  }

  public borrarFiltrosBuscador(): void {
    this.buscadorMetadatos.first.borrarFiltrosBuscador();
  }

  private FiltroEliminadas(): FiltroConsulta {
    return {
      Negacion: false,
      Operador: Operacion.OP_EQ,
      ValorString: 'false',
      Propiedad: 'Eliminada',
      Id: 'Eliminada',
      Valor: [false],
    };
  }
}
