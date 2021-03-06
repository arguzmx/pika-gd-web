import { EntidadesService, CONTEXTO } from './../services/entidades.service';
import { first } from 'rxjs/operators';
import {
  AppLogService,
  EntidadVinculada,
  TipoDespliegueVinculo,
  MetadataInfo, LinkVista,
} from '../../@pika/pika-module';
import { forkJoin } from 'rxjs';
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

export class EditorEntidadesBase {
  // Propiedades para la edición indivicual en una entidad vinculada
  public configTmp: ConfiguracionEntidad;
  public metadataTmp: MetadataInfo;
  public entidadTmp: any = null;
  public T: Traductor;
  // Determina si la entida den edición es una entidad vinculada
  public EditandoVinculada = false;

  public botonesLinkVista: LinkVista[] = [];
  public tieneBotonesVista: boolean = false;

  constructor(
    public entidades: EntidadesService,
    public applog: AppLogService,
    public router: Router,
    public diccionarioNavegacion: DiccionarioNavegacion,
  ) {}

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
    console.log(link);

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

      console.log(url);
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
    this.procesaNavegarVista(link);
  }

  // Este medodo debe sobrescribirse en el control cliente
  public procesaNavegarVista(link: LinkVista) {
    throw new Error('El método procesaNavegarVista se encuentra sin implementarse');
  }

  public ejecutaNavegarVista(link: LinkVista, entidad: any, metadata: MetadataInfo) {
      const parametros = {};
      metadata.Propiedades.forEach( p => {
        if (p.ParametroLinkVista) {
          parametros[p.Id] = entidad[p.Id];
        }
      });
      const url = this.diccionarioNavegacion.urlPorNombre(link.Vista);
      if (url) {
        this.router.navigate([url], { queryParams: parametros});
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
