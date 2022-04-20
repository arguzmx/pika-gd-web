import { PARAM_ID_ORIGEN, PARAM_TIPO_DESPLIEGUE } from './../../model/constantes';
import { EntidadesService } from './../../services/entidades.service';
import { Component, OnInit, OnDestroy, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfiguracionEntidad } from '../../model/configuracion-entidad';
import { PARAM_TIPO, PARAM_TIPO_ORIGEN } from '../../model/constantes';
import { Subject } from 'rxjs';
import { takeUntil, first } from 'rxjs/operators';
import { CacheEntidadesService } from '../../services/cache-entidades.service';
import { PermisoAplicacion, SesionStore, TipoDespliegueVinculo, TipoSeguridad } from '../../../@pika/pika-module';
import { CacheFiltrosBusqueda } from '../../services/cache-filtros-busqueda';
import { ServicioListaMetadatos } from '../../services/servicio-lista-metadatos';
import { EditorTabularComponent } from '../editor-tabular/editor-tabular.component';
import { EditorJerarquicoComponent } from '../editor-jerarquico/editor-jerarquico.component';

@Component({
  selector: 'ngx-editor-boot-tabular',
  templateUrl: './editor-boot-tabular.component.html',
  styleUrls: ['./editor-boot-tabular.component.scss'],
  providers: [EntidadesService, CacheEntidadesService, CacheFiltrosBusqueda, ServicioListaMetadatos],
})
export class EditorBootTabularComponent implements OnInit, OnDestroy {
  private onDestroy$: Subject<void> = new Subject<void>();
  config: ConfiguracionEntidad;
  @Input() desdeRuta: boolean = true;
  @Input() tipo: string = '';
  @Input() tipoOrigen: string = '';
  @Input() mostrarBarra: boolean = true;
  @Input() busuedaPersonalizada: boolean = false;
  @ViewChild("editor") editor: EditorTabularComponent;
  @Output() EventoResultadoBusqueda = new EventEmitter();
  @Output() EventNuevaSeleccion = new EventEmitter();

  constructor(
    private sesionStore: SesionStore,
    private entidades: EntidadesService,
    private route: ActivatedRoute,
    private router: Router) { }


  private paramTipo: string;
  private paramTipoOrigen: string;

  public ParamListener(): void {
    // Estas son las rutas definidas por entidad es el diccionario que vinvula con el backend
    const rutas = <any[]>this.route.snapshot.data['entidadesResolver'];
    if (rutas.length > 0) {
      this.sesionStore.setRutasTipo(rutas);
      if (this.desdeRuta) {
        this.InicializarDesdeRuta();
      } else {
        this.InicializarManual();
      }
    }
  }

  // c: "Elemento"
  // disp: "2"
  // id: "bd03c5b8-e1a1-4f5f-bbde-d8bd9ba99b32"
  // t: "Carpeta"
  // tipo: "puntomontaje"

  ngOnInit(): void {
    this.ParamListener();
  }


  InicializarDesdeRuta() {
    this.route.queryParams
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((params) => {

        this.paramTipo = (params[PARAM_TIPO] || '').toLowerCase();
        this.paramTipoOrigen = (params[PARAM_TIPO_ORIGEN] || '').toLowerCase();
        //console.log(params[PARAM_TIPO]);

        this.entidades.ObtieneMetadatos(params[PARAM_TIPO]).pipe(first())
          .subscribe(m => {
            let pcontenido: PermisoAplicacion = null;
            let permisos = true;

            // console.log(m);
            // console.log(m.TokenMod);
            if(m.TipoSeguridad == TipoSeguridad.AlIngreso) { 

              this.entidades.GetACL(m.Tipo, params[PARAM_ID_ORIGEN]).pipe(first()).subscribe(mask => {
                console.log(mask);
                pcontenido = this.entidades.CreaPermiso(m.TokenApp,m.TokenMod, mask);
                pcontenido.PermiteAltas = m.PermiteAltas;
                pcontenido.PermiteCambios = m.PermiteCambios;
                pcontenido.PermiteBajas = m.PermiteBajas;
                permisos = permisos &&  this.entidades.PermitirAccesoACL(pcontenido);
                this.Navegar(permisos, pcontenido, params);

              }, (err)=> {this.router.navigateByUrl('/pages/sinacceso');});              

            } else {
              if (m.TokenApp && m.TokenMod) {
                pcontenido = this.entidades.ObtienePermiso(m.TokenApp, m.TokenMod);
                pcontenido.PermiteAltas = m.PermiteAltas;
                pcontenido.PermiteCambios = m.PermiteCambios;
                pcontenido.PermiteBajas = m.PermiteBajas;
                permisos = permisos && this.entidades.PermitirAccesoACL(pcontenido);
              }
              this.Navegar(permisos, pcontenido, params);
            }

          }, (e) => {
            this.router.navigateByUrl('/pages/sinacceso');
          }, () => { });
      });
  }

  private Navegar(permisos: boolean, pcontenido:PermisoAplicacion, params: unknown ): void {
    if (permisos) {
      this.config = {
        TipoEntidad: this.paramTipo,
        OrigenTipo: this.paramTipoOrigen,
        OrigenId: params[PARAM_ID_ORIGEN] || '',
        TipoDespliegue: params[PARAM_TIPO_DESPLIEGUE] || '',
        TransactionId: this.entidades.NewGuid(),
        Permiso: pcontenido,
      };
    } else {
      this.router.navigateByUrl('/pages/sinacceso');
    }
  }

  InicializarManual() {

    this.paramTipo = this.tipo.toLowerCase();
    this.paramTipoOrigen = this.tipoOrigen.toLowerCase();
    this.entidades.ObtieneMetadatos(this.paramTipo).pipe(first())
      .subscribe(m => {
        let pcontenido = null;
        let permisos = true;

        // console.log(m);
        // console.log(m.TokenMod);
        if (m.TokenApp && m.TokenMod) {
          pcontenido = this.entidades.ObtienePermiso(m.TokenApp, m.TokenMod);
          permisos = permisos && this.entidades.PermitirAccesoACL(pcontenido);
        }

        // console.log(pcontenido);
        // console.log(permisos);
        if (permisos) {
          this.config = {
            TipoEntidad: this.paramTipo,
            OrigenTipo: this.paramTipoOrigen,
            OrigenId: '',
            TipoDespliegue: TipoDespliegueVinculo.Tabular,
            TransactionId: this.entidades.NewGuid(),
            Permiso: pcontenido,
          };
        } else {
          this.router.navigateByUrl('/pages/sinacceso');
        }

      }, (e) => {
        this.router.navigateByUrl('/pages/sinacceso');
      }, () => { });

  }

  public obtenerPaginaDatosPersonalizada(notificar: boolean, path: string, consulta: unknown): void {
    this.editor.obtenerPaginaDatosPersonalizada(notificar, path, consulta);
  }

  ngOnDestroy(): void {
    this.onDestroy$.next(null);
    this.onDestroy$.complete();
  }

  handlerEventoResultadoBusqueda(data: unknown) {
    this.EventoResultadoBusqueda.emit(data);
  }

  handlerEventNuevaSeleccion(data: unknown) {
    this.EventNuevaSeleccion.emit(data);
  }
  
  public NavegarLinkPorTag(tag: string, parametros: Map<string, string>, newWindow: boolean = false) {
    this.editor.navegarVistaPoTag(tag, parametros, newWindow);
  }

  public mostrarSelectorColumnas() {
    this.editor.mostrarSelectorColumnas();
  }

}
