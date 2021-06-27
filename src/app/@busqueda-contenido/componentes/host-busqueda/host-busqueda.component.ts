import { AppEventBus, EventoCerrarPlugins, VISOR } from './../../../@pika/state/app-event-bus';
import { BMetadatosComponent } from './../b-metadatos/b-metadatos.component';
import { BPropiedadesComponent } from './../b-propiedades/b-propiedades.component';
import { CacheFiltrosBusqueda } from './../../../@editor-entidades/services/cache-filtros-busqueda';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil, first } from 'rxjs/operators';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { AppLogService } from '../../../@pika/servicios';
import { EditorBootTabularComponent, MetadataTablaComponent, ServicioListaMetadatos, Traductor } from '../../../@editor-entidades/editor-entidades.module';
import { ServicioBusquedaAPI } from '../../services/servicio-busqueda-api';
import { Busqueda, BusquedaContenido, EstadoBusqueda } from '../../model/busqueda-contenido';
import { Operacion } from '../../../@pika/consulta';

@Component({
  selector: 'ngx-host-busqueda',
  templateUrl: './host-busqueda.component.html',
  styleUrls: ['./host-busqueda.component.scss'],
  providers: [CacheFiltrosBusqueda, ServicioBusquedaAPI, ServicioListaMetadatos]
})
export class HostBusquedaComponent implements OnInit, OnDestroy {
  private onDestroy$: Subject<void> = new Subject<void>();

  @ViewChild("propiedades") propiedades: BPropiedadesComponent;
  @ViewChild("metadatos") metadatos: BMetadatosComponent;
  @ViewChild('tabla') tabla: EditorBootTabularComponent;

  IdRepositorio: string = '';
  ElementoBusquedaActivo = false;
  MostrarRegresar: boolean = true;
  VistaTrasera: boolean = false;
  MotrarMetadatos: boolean = false;
  MostrarPropiedades: boolean = false;
  mostrarBarra: boolean = false;
  busuedaPersonalizada: boolean = true;
  totalRegistros: number = 0;
  documentoSeleccionado: any;
  contenidoSeleccionado: boolean = false;
  nombreRepo: string;
  contenidoVisible: boolean = true

  DesdeRuta = false;
  Tipo = 'Elemento';

  public T: Traductor;

  constructor(
    ts: TranslateService,
    private appEventBus:AppEventBus,
    private api: ServicioBusquedaAPI,
    private applog: AppLogService,
    private location: Location,
    private route: ActivatedRoute,
    private router: Router) {
    this.T = new Traductor(ts);

    this.appEventBus.LeeEventos().subscribe(ev => {
      switch (ev.tema) {
        case VISOR:
          this.contenidoVisible = false;
          break;

        case EventoCerrarPlugins.tema:
          this.contenidoVisible = true;
          break;

      }
    });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next(null);
    this.onDestroy$.complete();
  }

  ngOnInit(): void {
    this.ParamListener();
  }

  public ParamListener(): void {

    this.route.queryParams
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((params) => {
        this.IdRepositorio = params.OrigenId;
        this.cargaRepo();
        this.CargaTraducciones();
      }, (e) => {
        this.router.navigateByUrl('/pages/sinacceso');
      }, () => { });

  }

  private cargaRepo() {
    this.api.ObtieneDatosRepositorio(this.IdRepositorio).subscribe(
      r => {
        this.nombreRepo = r["Nombre"];
      }
    )
  }

  private CargaTraducciones() {
    this.T.ts = [
      'ui.regresar',
      'busqueda.bmetadatos',
      'busqueda.bpropiedades',
      'busqueda.bfolder',
      'busqueda.btexto',
      'busqueda.buscar',
      'ui.total-regitros',
      'vistas.visorcontenido',
      'ui.selcol'
    ];
    this.T.ObtenerTraducciones();
  }

  reset(): void {
    this.MostrarRegresar = true;
    this.VistaTrasera = false;
    this.MotrarMetadatos = false;
  }

  public regresar() {
    this.location.back();
  }


  alternarMetadatos(): void {
    this.MotrarMetadatos = !this.MotrarMetadatos;
    this.actualizaUI();
  }

  actualizaUI() {
    this.ElementoBusquedaActivo = this.MostrarPropiedades || this.MotrarMetadatos;
  }

  public alternarPropiedades() {
    this.MostrarPropiedades = !this.MostrarPropiedades;
    this.actualizaUI();
  }

  public NewGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0,
        v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  public buscar(): void {

    var esValida: boolean = false;

    const b: BusquedaContenido = {
      Id: this.NewGuid(),
      Elementos: [],
      Fecha: new Date(),
      FechaFinalizado: new Date(),
      Estado: EstadoBusqueda.Nueva,
      PuntoMontajeId: this.IdRepositorio,
      indice: 0,
      tamano: 50,
      consecutivo: 0,
      ord_columna: 'Nombre',
      ord_direccion: 'asc',
      recalcular_totales: true,
      PlantillaId: '',
      FiltrosBase: []

    };

    b.FiltrosBase.push({
      Propiedad: 'PuntoMontajeId',
      Operador: Operacion.OP_EQ,
      Negacion: false,
      NivelFuzzy: -1,
      Valor: this.IdRepositorio,
      ValorString: this.IdRepositorio
    })

    if (this.MostrarPropiedades) {

      if (this.propiedades.Filtros().length >= 0) {
        const propiedes: Busqueda = {
          Tag: 'propiedades',
          Topico: 'propiedades',
          Consulta: {
            Filtros: this.propiedades.Filtros()
          }
        }

        b.Elementos.push(propiedes);

        esValida = true;
      }
    }

    if (this.MotrarMetadatos) {

      if (this.metadatos.Filtros().length > 0) {
        b.PlantillaId = this.metadatos.Topic;
        const metadatos: Busqueda = {
          Tag: 'metadatos',
          Topico: this.metadatos.Topic,
          Consulta: {
            Filtros: this.metadatos.Filtros()
          }
        }
        b.Elementos.push(metadatos);
        esValida = true;
      }

    }

    if (esValida) {
      this.tabla.obtenerPaginaDatosPersonalizada(true, 'api/v1.0/contenido/Busqueda', b);
    } else {
      this.applog.AdvertenciaT(
        'busqueda.busqueda-novalida',
        null,
        null,
      );
    }

  }

  handlerEventoResultadoBusqueda(data: unknown) {
    this.totalRegistros = data["ConteoTotal"];
  }
  handlerEventNuevaSeleccion(data: unknown) {
    this.documentoSeleccionado = data;

    this.contenidoSeleccionado = data != null;

  }

  public NavegarAVisor() {
    this.tabla.NavegarLinkPorTag('visorcontenido', true);
  }

  public mostrarSelectorColumnas() {
    this.tabla.mostrarSelectorColumnas();
  }

}
