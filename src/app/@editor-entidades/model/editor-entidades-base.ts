import { EventoAplicacion, PayloadItem } from './../../@pika/eventos/evento-aplicacion';
import { AppEventBus, EventoCerrarPlugins, VISOR } from './../../@pika/state/app-event-bus';
import { EntidadesService, CONTEXTO } from './../services/entidades.service';
import { debounceTime, distinctUntilChanged, filter, finalize, first, switchMap, takeUntil, tap } from 'rxjs/operators';
import {
  EntidadVinculada,
  TipoDespliegueVinculo,
  MetadataInfo, LinkVista,
} from '../../@pika/pika-module';
import { forkJoin, Subject } from 'rxjs';
import { ConfiguracionEntidad } from './configuracion-entidad';
import {
  PARAM_TIPO,
  PARAM_TIPO_ORIGEN,
  PARAM_TIPO_JERARQUICO,
  PARAM_TIPO_ARBOL_JERARQUICO,
  PARAM_TIPO_CONTENIDO_JERARQUICO,
  PARAM_ID_JERARQUICO,
  PARAM_ID_ORIGEN,
  PARAM_TIPO_DESPLIEGUE,
} from './constantes';
import { Router } from '@angular/router';
import { Traductor } from '../services/traductor';
import { DiccionarioNavegacion } from './i-diccionario-navegacion';
import { AppLogService } from '../../services/app-log/app-log.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

export class EditorEntidadesBase {
  // Propiedades para la edición indivicual en una entidad vinculada
  public configTmp: ConfiguracionEntidad;
  public metadataTmp: MetadataInfo;
  public entidadTmp: any = null;
  public T: Traductor;
  // Determina si la entida den edición es una entidad vinculada
  public EditandoVinculada = false;
  public contenidoVisible: boolean = true;
  public baseFormGroup: FormGroup;
  public searchCtrl: FormControl = new FormControl('');
  public textoBusqueda: string = '';
  public minLengthTerm =2;
  public botonesLinkVista: LinkVista[] = [];
  public tieneBotonesVista: boolean = false;
  public onDestroy$: Subject<void> = new Subject<void>();
  
  constructor(
    public fb: FormBuilder,
    public appEventBus: AppEventBus,
    public entidades: EntidadesService,
    public applog: AppLogService,
    public router: Router,
    public diccionarioNavegacion: DiccionarioNavegacion,
  ) {

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

   EliminarBusquedaTexto() {
    if(this.baseFormGroup) {
      this.searchCtrl.patchValue('');  
      this.textoBusqueda = '';
    }  
   }


   hookTypeAhead() {

    this.baseFormGroup = this.fb.group({});
    this.baseFormGroup.addControl('searchCtrl', this.searchCtrl);
    this.searchCtrl.valueChanges
    .pipe(takeUntil(this.onDestroy$))
    .pipe(
      filter(res => {
        return res !== null && res!== undefined && res.length >= this.minLengthTerm
      }),
      distinctUntilChanged(),
      debounceTime(1000),
    )
    .subscribe(v=> {
      this.textoBusqueda = v;
    });



    // this.searchCtrl.valueChanges
    // .pipe(
    //   filter(res => {
    //     return res !== null && res!== undefined && res.length >= this.minLengthTerm
    //   }),
    //   distinctUntilChanged(),
    //   debounceTime(1000),
    //   tap(() => {
    //     console.log('tap');
    //     // this.errorMsg = "";
    //     // this.filteredItems = [];
    //     // this.isLoading = true;
    //   }),
    //   // switchMap( term => console.log(term))
    //   //   .pipe(
    //   //     finalize(() => {
    //   //       // this.isLoading = false
    //   //     }),
    //   //   )
    //   // )
    // )
    // .subscribe( items => {
    //   console.log(items);
    //   // if(items.length == 0) {
    //   //   this.applog.AdvertenciaT('ui.sin-regitros-busqueda', null, { texto : this.group.get(this.shadowControl).value } );
    //   // }
    //   // this.filteredItems = items;
    //   // this.cdr.detectChanges();
    // })
  }

  // Gestion de vínculose
  // -------------------------------------------------------------
  // -------------------------------------------------------------

  public CerrarDialogos() {
    // Esta funcion debe incluirse como override en la clase heredada
    throw new Error('Method not implemented.');
  }

  public MostrarTarjetaTrasera(op: string) {
    // Esta funcion debe incluirse como override en la clase heredada
    throw new Error('Method not implemented.');
  }

  public _Reset(): void {
    // Esta funcion debe incluirse como override en la clase heredada
    throw new Error('Method not implemented.');
  }

  IrALink(
    link: EntidadVinculada,
    entidad: any,
    config: ConfiguracionEntidad,
  ): void {
    if (entidad) {
      this.CerrarDialogos();
      if (link.HijoDinamico) {
        switch (link.TipoDespliegue) {
          case TipoDespliegueVinculo.EntidadUnica:
            this.SeguirLinkEntidadUnica(link, entidad, config);
            break;
        }
      } else {
        this.SeguirLink(link, entidad, config);
      }
    } else {
      this.applog.AdvertenciaT(
        'editor-pika.mensajes.warn-sin-seleccion',
        null,
        null,
      );
    }
  }

  private SeguirLink(
    link: EntidadVinculada,
    entidad: any,
    config: ConfiguracionEntidad,
    
  ) {
    const Id = this.entidades.ObtenerIdEntidad(config.TipoEntidad, entidad);
    if (Id) {
      let url = '';
      switch (link.TipoDespliegue) {
        case TipoDespliegueVinculo.Tabular:
          url = this.ObtieneVinculoTabular(link, Id, config);
          break;

        case TipoDespliegueVinculo.Membresia:
          url = this.ObtieneVinculoTabular(link, Id, config);
          break;

        case TipoDespliegueVinculo.Jerarquico:
          url = this.ObtieneVinculoJerarquico(link, Id, config);
          break;
      }

      if (url) {
        url = url + `&${PARAM_TIPO_DESPLIEGUE}=${link.TipoDespliegue}`;
        this.entidades.SetCacheInstanciaEntidad(
          config.TipoEntidad,
          Id,
          entidad,
        );
        this._Reset();
        this.router.navigateByUrl(url);
      } else {
        this.applog.FallaT(
          'editor-pika.mensajes.err-config-vinculo',
          null,
          null,
        );
      }
    } else {
      this.applog.FallaT('editor-pika.mensajes.err-id-vinculo', null, null);
    }
  }

  private SeguirLinkEntidadUnica(
    link: EntidadVinculada,
    entidad: any,
    config: ConfiguracionEntidad,
  ) {
    const Id = this.entidades.ObtenerIdEntidad(config.TipoEntidad, entidad);
    const valor = entidad[link.EntidadHijo];
    const tipoentidad = link.DiccionarioEntidadesVinculadas.find(
      (x) => x.Id === valor,
    );
    if (tipoentidad) {
      const metadatos = this.entidades
        .ObtieneMetadatos(tipoentidad.Enidad)
        .pipe(first());
      const instancia = this.entidades.ObtenerEntidadUnica(
        tipoentidad.Enidad,
        Id,
      );
      forkJoin([metadatos, instancia]).subscribe((resultados) => {
        this.entidades.SetCachePropiedadContextual(
          link.PropiedadHijo,
          CONTEXTO,
          '',
          Id,
        );
        this.configTmp = {
          TipoEntidad: tipoentidad.Enidad,
          OrigenTipo: '',
          OrigenId: '',
          TransactionId: this.entidades.NewGuid(),
          TipoDespliegue: TipoDespliegueVinculo.EntidadUnica,
        };
        this.metadataTmp = resultados[0];
        this.entidadTmp = resultados[1];
        this.EditandoVinculada = true;
        this.MostrarTarjetaTrasera('editar');
      });
    }
  }

  private ObtieneVinculoTabular(
    link: EntidadVinculada,
    Id: string,
    config: ConfiguracionEntidad,
  ): string {
    let url = `/pages/tabular?${PARAM_TIPO}=${link.EntidadHijo}`;
    url =
      url +
      `&${PARAM_TIPO_ORIGEN}=${config.TipoEntidad}&${PARAM_ID_ORIGEN}=${Id}`;
    return url;
  }

  private ObtieneVinculoJerarquico(
    link: EntidadVinculada,
    Id: string,
    config: ConfiguracionEntidad,
  ): string {
    const entidadArbol = link.EntidadHijo.split(',')[0];
    const entidadContenido = link.EntidadHijo.split(',')[1];
    let url = `/pages/jerarquia?${PARAM_TIPO_JERARQUICO}=${config.TipoEntidad}`;
    url = url + `&${PARAM_TIPO_ARBOL_JERARQUICO}=${entidadArbol}`;
    url = url + `&${PARAM_TIPO_CONTENIDO_JERARQUICO}=${entidadContenido}`;
    url = url + `&${PARAM_ID_JERARQUICO}=${Id}`;
    return url;
  }

  public navegarVista(link: LinkVista) {
    this.procesaNavegarVista(link, null);
  }

  // Este medodo debe sobrescribirse en el control cliente
  public procesaNavegarVista(link: LinkVista, parametros: Map<string, string>) {
    throw new Error('El método procesaNavegarVista se encuentra sin implementarse');
  }


  public ejecutaNavegarVistaTag(tag: string) {

  }

  public ejecutaNavegarAppEvento(TipoEntidad: string, link: LinkVista, entidad: any, metadata: MetadataInfo, params: Map<string, string>,) {
    const parametros: PayloadItem[] = [];
    if (entidad != null) {
      metadata.Propiedades.forEach(p => {
        if (p.ParametroLinkVista) {
          parametros.push({ id: p.Id, valor: entidad[p.Id], valores: [] });
        }
      });
    }

    if(params) {
      params.forEach((value: string, key: string) => {
        parametros.push({ id: key, valor: value, valores: [] });
      });
    }

    const evento: EventoAplicacion = {
      id:  this.ObtenerIdEntidad(metadata, entidad), tema: link.Vista, payload: parametros
    };
    this.appEventBus.EmiteEvento(evento);
  }

  public ejecutaVavegarContenidoVinculado(event: any) {
    this.appEventBus.EmiteEvento(event);
  }


  public ObtenerIdEntidad(m: MetadataInfo, entidad: any): string {
    const index = m.Propiedades.findIndex(x => x.EsIdRegistro === true);

    if (index >= 0) {
      return String(entidad[m.Propiedades[index].Id]);
    }

    if (entidad['Id']) return entidad['Id'];

    if (entidad['id']) return entidad['id'];

    return '';
  }

  public ejecutaNavegarVista(TipoEntidad: string, link: LinkVista, entidad: any, metadata: MetadataInfo, params: Map<string, string>, newWindow: boolean = false) {
    const parametros = { tipo: TipoEntidad };
    var parametrosString = '';
    if (entidad != null) {
      metadata.Propiedades.forEach(p => {
        if (p.ParametroLinkVista) {
          parametros[p.Id] = entidad[p.Id];
          if (parametrosString != '') parametrosString += '&';
          parametrosString += encodeURIComponent(p.Id) + '=' + encodeURIComponent(entidad[p.Id]);
        }
      });
    }
    const url = this.diccionarioNavegacion.urlPorNombre(link.Vista);
    parametrosString = url + '?' + parametrosString;
    if (url) {
      if (newWindow) {
        window.open(parametrosString, 'blank');
      } else {
        this.router.navigate([url], { queryParams: parametros });
      }
    } else {
      this.applog.FallaT(
        'editor-pika.mensajes.err-config-vinculo',
        null,
        null,
      );
    }
  }

  public refrescarTabla(): void {
    // Debe estar presente en la clase derivada
  }

  public ejecutaNavegarWebCommand(link: LinkVista, entidad: any, metadata: MetadataInfo) {
    const parametros = {};
    if (entidad != null) {
      metadata.Propiedades.forEach(p => {
        if (p.ParametroLinkVista) {
          parametros[p.Id] = entidad[p.Id];
        }
      });
    }

    this.entidades.PostCommand(metadata.Tipo, link.Vista, parametros)
    .pipe(first())
    .subscribe(r=> {
      // console.log(r)
      if (r) {
        if (r.Estatus) {
          this.refrescarTabla();
          this.applog.ExitoT(
            `editor-pika.mensajes.${r.MensajeId}`,
            null,
            null,
          );  
        } else {
          this.applog.AdvertenciaT(
            `editor-pika.mensajes.${r.MensajeId}`,
            null,
            null,
          );  
        }
      } else {
        this.applog.FallaT(
          'editor-pika.mensajes.err-ejecutar-comandoweb',
          null,
          null,
        );  
      }
    }) 
  }

  public ejecutaNavegarVistaParametros(TipoEntidad: string, link: LinkVista, parametros: unknown) {
    parametros['tipo'] = TipoEntidad;
    const url = this.diccionarioNavegacion.urlPorNombre(link.Vista);
    if (url) {
      this.router.navigate([url], { queryParams: parametros });
    } else {
      this.applog.FallaT(
        'editor-pika.mensajes.err-config-vinculo',
        null,
        null,
      );
    }
  }

  public tituloNavegarLista(link: LinkVista) {
    return this.T.t[`vistas.${link.Vista}`];
  }

}
