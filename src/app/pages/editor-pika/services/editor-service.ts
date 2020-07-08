import { SesionQuery } from './../../../@pika/state/sesion.query';
import { Dictionary } from './../../../@core/comunes/dictionary';
import { TraduccionEntidad } from './../../../@core/comunes/traduccion-entidad';
import { TranslateService } from '@ngx-translate/core';
import { AppLogService } from './../../../@pika/servicios/app-log/app-log.service';
import { Consulta } from './../../../@pika/consulta/consulta';
import { environment } from './../../../../environments/environment.prod';
import { FiltroConsulta } from './../../../@pika/consulta/filtro-consulta';
import { BehaviorSubject, Observable, Subject } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd, NavigationStart } from '@angular/router';
import { HttpClient, HttpResponseBase } from '@angular/common/http';
import { PikaApiService } from '../../../@pika/pika-api';
import { MetadataInfo, Propiedad } from '../../../@pika/metadata';
import { Paginado } from '../../../@pika/consulta';
import { debounceTime, first, takeUntil, filter } from 'rxjs/operators';
import { ResultadoAPI, TipoOperacionAPI } from '../../../@pika/pika-api/resultado-api';
import { TarjetaVisible } from '../model/tarjeta-visible';
import { AtributoLista } from '../../../@pika/metadata/atributo-valorlista';
import { Evento } from '../../../@pika/metadata/atributo-evento';
import { TextoDesdeId } from '../../../@pika/metadata/texto-desde-id';
import { ValorListaOrdenada } from '../../../@pika/metadata/valor-lista';

@Injectable()
    export class EditorService {
    private onDestroy$: Subject<void> = new Subject<void>();

    private diccionarioMetadatos: Dictionary = new Dictionary();

    public usarPaginadoRelacional: boolean = false;

    // Entidad actual recibida vía el ruteo
    public entidad: string;
    public PropCache: Dictionary;

    // Propeidades para navegación vinculada
    public TipoOrigenId: string = '';
    public OrigenId: string = '';
    public OrigenNombre: string = '';
    private isHardReset: boolean = false;

    // Filtros de búsqueda disponbiles para el editor actual
    private filtros: FiltroConsulta[] = [];
    private consultaActual: Consulta = null;
    private paginaActual: Paginado<any> = null;

    // CLiente APi PIKA
    public cliente: PikaApiService<any, string>;

    public metadatos: MetadataInfo = null;
    public propiedadesLista: string [] = [];

    // Almacena las traudcciones de un nomnre de instancoi para un identificador
    public ListaIds: TextoDesdeId[] = [];

    // Almacena el nombre de una instancia en base a su Id
    public NombreIds: TextoDesdeId[] = [];

    // Subjects relacionados con la gestión de configuración de búsueda
    private EliminaFiltroSubject = new BehaviorSubject(null);
    private EliminaTodosFiltrosSubject = new BehaviorSubject(null);
    private FiltrosSubject = new BehaviorSubject([]);
    private FiltrosValidosSubject = new BehaviorSubject(false);
    private ResetSubject = new BehaviorSubject(false);

    // Subject relacionados con la gestion de metadatos
    private MetdatosDisponibles = new BehaviorSubject(null);

    // Subject relacionados con llamadas a meetodos de API
    private NuevaPaginaisponible = new BehaviorSubject(null);
    private NuevaListaDisponible = new BehaviorSubject(null);
    private EventosDisponibles = new BehaviorSubject(null);

    // Subjet para CRUD de API
    private SubjectEditarEntidad = new BehaviorSubject(null);
    private SubjectEntidadSeleccionada = new BehaviorSubject(null);
    private ResultadoAPI = new BehaviorSubject(null);
    private LlamadaAPI = new BehaviorSubject(null);

    // Subjects de UI
    private TarjetaTraseraVivible = new BehaviorSubject(null);

    // Subject relacionados con la gestion mensajes en la UI
    private Notificacion = new BehaviorSubject(null);

    // Contructor
    constructor(
      private sesionQuery: SesionQuery,
      private ts: TranslateService,
      private router: Router,
      private route: ActivatedRoute,
      private applog: AppLogService,
      private http: HttpClient) {
      this.InitPropCache();
      this.InitByRoute();
    }


    Push2StackId(entidadOrigen: string, id: string, entidadDestino: string, nombre: string): void {

    const index = this.NombreIds.findIndex( x => x.Entidad === entidadOrigen.toLocaleLowerCase()
    && x.Id === id);
    if ( index < 0 ){
      this.NombreIds.push( { Texto: nombre, Id: id, Entidad: entidadOrigen.toLocaleLowerCase() } );
    } else {
      this.NombreIds[index].Texto = nombre;
    }

    // tslint:disable-next-line: max-line-length
    this.router.navigateByUrl(`/pages/editor?${environment.editorToken}=${entidadDestino}&${environment.editorTokenOrigenId}=${id}&${environment.editorTokenOrigen}=${entidadOrigen}`);
  }

  private InitPropCache(): void {
    this.PropCache = new Dictionary();
    this.sesionQuery.dominioid$.pipe(takeUntil(this.onDestroy$))
    .subscribe( d => {
      this.PropCache.set('DominioId', d);
    });
  }

   // Inicia el proceso de configuración para el tipo de entidad
   private InitByName(entidad: string): void {
    this.Reset(this.isHardReset);
    if (this.isHardReset) this.isHardReset = false;

    if (this.diccionarioMetadatos.has(entidad)) {
      let m: MetadataInfo = JSON.parse(JSON.stringify(this.diccionarioMetadatos.get(entidad)));
      m = this.ProcesarMetadatos(m);
      this.EstableceMetadatos(m);
    } else {
      this.LlamadaAPI.next(false);
      this.cliente = new PikaApiService(environment.apiUrl, this.http);
      this.cliente.GetMetadata(entidad).pipe(first())
      .subscribe(metadatos => {
          this.diccionarioMetadatos.set(entidad, metadatos);
          let m: MetadataInfo = JSON.parse(JSON.stringify(metadatos));
          m = this.ProcesarMetadatos(m);
          this.EstableceMetadatos(m);
      }, (error) => {
          this.handleHTTPError(error, 'metadatos', '');
      },
        () => {
          this.LlamadaAPI.next(false);
      });
    }
   }


   // Establece las propiedades por defecto de los metadatos
   private ProcesarMetadatos(m: MetadataInfo): MetadataInfo {
      this.usarPaginadoRelacional = false;
      this.entidad = m.Tipo.toLowerCase();

      const cachekeys =  Object.keys(this.PropCache.items);
      for ( let i = 0; i < m.Propiedades.length; i++ ) {
        if (cachekeys.indexOf(m.Propiedades[i].Id) >= 0 ) {
          m.Propiedades[i].ValorDefault = this.PropCache.get(m.Propiedades[i].Id);
        }
      }

      if (m.PaginadoRelacional && m.PaginadoRelacional === true) {
          this.usarPaginadoRelacional = true;
          for ( let i = 0; i < m.Propiedades.length; i++ ) {
              if (m.Propiedades[i].Id === 'OrigenId') m.Propiedades[i].ValorDefault = this.OrigenId;
              if (m.Propiedades[i].Id === 'TipoOrigenId') m.Propiedades[i].ValorDefault = this.TipoOrigenId;
          }
      }
      return m;
   }

    // al iniciar por ruta
    public InitByRoute(): void {
        this.route.queryParams
        .subscribe(
            (params) => {
              this.entidad = '';
              this.OrigenNombre = '';
              if (params[environment.editorToken]) {
                this.entidad = params[environment.editorToken].toLocaleLowerCase();
                this.TipoOrigenId  = params[environment.editorTokenOrigen] ?
                  params[environment.editorTokenOrigen] : null;
                this.OrigenId = params[environment.editorTokenOrigenId] ?
                  params[environment.editorTokenOrigenId] : null;
                if (this.OrigenId && this.TipoOrigenId) {
                    const index = this.NombreIds
                    .findIndex(x => x.Entidad === this.TipoOrigenId.toLocaleLowerCase() &&
                      x.Id === this.OrigenId);

                    if ( index >= 0) {
                        this.OrigenNombre = this.NombreIds[index].Texto;
                    }
                }
                if (!this.OrigenNombre) {
                  this.OrigenNombre = '';
                }
              }
              if (this.entidad !== '') {
                this.InitByName(this.entidad);
              } else {
                this.applog.FallaT('editor-pika.mensajes.err-entidad-ruta');
              }
            },
            (error) => {
              this.applog.FallaT('editor-pika.mensajes.err-param-ruta');
            },
          );
    }

    private handleHTTPError(error: Error, modulo: string, nombreEntidad: string ): void {
      if (error instanceof  HttpResponseBase) {

        if (error.status === 401) {
          this.router.navigate(['/acceso/login']);
        } else {
          this.MuestraErrorHttp(error, modulo, nombreEntidad);
        }

      } else {

      }

    }

private MuestraErrorHttp(error: Error, modulo: string, nombreEntidad: string): void {
  const traducciones: string[] = [];
  traducciones.push('entidades.' + modulo);

  this.ts.get(traducciones)
  .pipe(first())
  .subscribe( t => {

    let trad: TraduccionEntidad =  null;
    if ((t['entidades.' + modulo] !== 'entidades.' + modulo)
      && t['entidades.' + modulo].indexOf('|') > 0 ) {
      trad = new TraduccionEntidad(t['entidades.' + modulo]);
    } else {
      trad = new TraduccionEntidad( modulo + '|' + modulo + 's|' + '|');
    }

    if (error instanceof  HttpResponseBase) {
      switch (error.status) {

        case 400:
            this.applog.FallaT('editor-pika.mensajes.err-datos-erroneos', null,
            { entidad: trad.singular, prefijo: trad.prefijoSingular  } );
            break;

        case 404:
            this.applog.FallaT('editor-pika.mensajes.err-datos-noexiste', null,
            { entidad: trad.singular, prefijo: trad.prefijoSingular  } );
            break;

        case 409:
            this.applog.FallaT('editor-pika.mensajes.err-datos-conflicto', null,
            { entidad: trad.singular, prefijo: trad.prefijoSingular  } );
            break;

          case 500:
            this.applog.FallaT('editor-pika.mensajes.err-datos-servidor', null,
            { entidad: trad.singular, prefijo: trad.prefijoSingular, error: error.statusText } );
            break;
      }
    }
  });

}

private Reset(hard: boolean): void {
  this.PropCache.clear();
  this.entidad = '';
  this.filtros = [];
  this.consultaActual = null;
  this.paginaActual = null;
  this.metadatos = null;
  this.ResetSubject.next(true);
}

    // --------------------------------------------------------------------------------------------------------------
    // --------------------------------------------------------------------------------------------------------------

    // GEstión de listas
    // ------------------------------------------------------
    ObtieneNuevasListas(): Observable<AtributoLista> {
      return this.NuevaListaDisponible.asObservable();
    }

    SolicitarLista(lista: AtributoLista, consulta: Consulta) {
      let lid = `list-${lista.Entidad}`;
      consulta.FiltroConsulta.forEach( f => {
        lid  = lid + f.Propiedad + '-' + f.Valor;
      });

      if (this.diccionarioMetadatos.has(lid)) {
        lista.Valores = this.diccionarioMetadatos.get(lid);
        this.NuevaListaDisponible.next(lista);
        return;
      }

      // Obtiene de la red si la lista no esta en cache
      this.cliente.PairList(lista, consulta).pipe(
         debounceTime(500),
      ).subscribe( resultado =>  {
         lista.Valores = resultado;
         this.diccionarioMetadatos.set(lid, resultado);
         this.NuevaListaDisponible.next(lista);
      }, (err) => {
        this.handleHTTPError(err, this.entidad, '');
        lista.Valores = null;
        this.NuevaListaDisponible.next(lista);
      });
    }


    // Eventos interproceso
    // ---------------------------------------
    ObtieneEventos(): Observable<Evento> {
      return this.EventosDisponibles.asObservable();
    }

    EmiteEvento (evt: Evento): void {
        this.EventosDisponibles.next(evt);
    }


    // Eventos UI
    // ------------------------------------------------------

    ObtieneResetUI(): Observable<boolean> {
      return this.ResetSubject.asObservable();
    }

    ObtieneTarjetaTraseraVisible(): Observable<TarjetaVisible> {
      return this.TarjetaTraseraVivible.asObservable();
    }

    EstableceTarjetaTraseraVisible(tarjeta: TarjetaVisible) {
      this.TarjetaTraseraVivible.next(tarjeta);
    }

    // Eventos CRUD
    // ------------------------------------------------------

    ObtieneEditarEntidad(): Observable<any> {
      return this.SubjectEditarEntidad.asObservable();
    }

    ObtieneEnLlamadaAPI(): Observable<boolean> {
      return this.LlamadaAPI.asObservable();
    }

    ObtieneResultadoAPI(): Observable<ResultadoAPI> {
      return this.ResultadoAPI.asObservable();
    }

    ObtieneEntidadSeleccionada(): Observable<any> {
      return this.SubjectEntidadSeleccionada.asObservable();
    }

    EntidadSeleccionada(entidad: any): void {
      this.SubjectEntidadSeleccionada.next(entidad);
    }

    EditarEntidad(entidad: any): void {
      this.SubjectEditarEntidad.next(entidad);
    }

    ActualizarEntidad(Id: string, entidad: any, idoperacion: string): void  {
      this.LlamadaAPI.next(true);
       const nombre = this.ObtenerNombre(entidad);
       this.cliente.Put(Id, entidad, this.entidad).pipe(
         debounceTime(500),
       ).subscribe( resultado =>  {

        this.applog.ExitoT('editor-pika.mensajes.ok-entidad-act', null, { nombre: nombre});
        this.ResultadoAPI.next( this.CreaRespuestaAPI(true, idoperacion,
          TipoOperacionAPI.Actualizar,  null, nombre, resultado));

       }, (err) => {
        this.handleHTTPError(err, this.entidad, nombre);
        this.ResultadoAPI.next( this.CreaRespuestaAPI(false, idoperacion,
          TipoOperacionAPI.Actualizar, err, nombre));

        }, () => {
        this.LlamadaAPI.next(false);
       } );
     }

   CreaEntidad(entidad: any, idoperacion: string): void  {
    this.LlamadaAPI.next(true);
     const nombre = this.ObtenerNombre(entidad);
     this.cliente.Post(entidad, this.entidad).pipe(
       debounceTime(500),
     ).subscribe( resultado =>  {

      this.applog.ExitoT('editor-pika.mensajes.ok-entidad-add', null, { nombre: nombre});
      this.ResultadoAPI.next( this.CreaRespuestaAPI(true, idoperacion,
        TipoOperacionAPI.Crear,  null, nombre, resultado));

     }, (error) => {
      this.handleHTTPError(error, this.entidad, '');
      this.ResultadoAPI.next( this.CreaRespuestaAPI(false, idoperacion,
        TipoOperacionAPI.Crear, error, nombre));

     }, () => {
      this.LlamadaAPI.next(false);
     } );
   }


   EliminarEntidad(Id: string, nombre: string, idoperacion: string): void  {
    this.LlamadaAPI.next(true);
     this.cliente.Delete([Id], this.entidad).pipe(
       debounceTime(500),
     ).subscribe( resultado =>  {

      this.applog.ExitoT('editor-pika.mensajes.ok-entidad-del', null, { nombre: nombre});
      this.ResultadoAPI.next( this.CreaRespuestaAPI(true, idoperacion,
        TipoOperacionAPI.Eliminar,  null, nombre, resultado));
     }, (error) => {
      this.handleHTTPError(error, this.entidad, '');
      this.ResultadoAPI.next( this.CreaRespuestaAPI(false, idoperacion,
        TipoOperacionAPI.Eliminar, error, nombre));
     }, () => {
      this.LlamadaAPI.next(false);
     } );
   }

   // INtenta obtener le nombre de la entidad para el despliegue
   private ObtenerNombre(entidad: any): string {
      let n: string = '';
      if (entidad['Nombre']) n = entidad['Nombre'];
      if ((n === '') && (entidad['Descripcion'])) n = entidad['Descripcion'];
      return n;
   }

   private CreaRespuestaAPI(ok: boolean, id: string, tipo: TipoOperacionAPI,
    err?: any, nombre?: string, entidad?: any): ResultadoAPI {
    const r = new ResultadoAPI();
    r.operacion = tipo;
    r.nombre = nombre ? nombre : '';
    r.ok = ok;
    r.idoperacion = id;
    r.error = err;
    r.entidad = entidad;
    return r;
   }

    // Eventos paginado de datos
    // ------------------------------------------------------
    ObtieneNuevaPaginaisponible(): Observable<Paginado<any>> {
        return this.NuevaPaginaisponible.asObservable();
    }


    NuevaConsulta(consulta: Consulta): void {

      if (this.usarPaginadoRelacional) {
        this.ObtenerPaginaRelacional(consulta);
      } else {
        this.ObtenerPagina(consulta);
      }

    }

    private BuscaTextoDeIdentificadores(pagina: Paginado<any>): void {
      const metadata: MetadataInfo = this.diccionarioMetadatos.get(this.entidad);
      const buscar: string [] = [];

      metadata.Propiedades.forEach( p => {
        if (p.AtributoLista) {
          let ids = '';
          // Recorre todos los elementos de la misma propiedad y obtiene
          // los Ids inexitsnetes en el diccionario
          pagina.Elementos.forEach( item => {
            if (this.ListaIds.findIndex(x =>  x.Id === item[p.Id] &&
              x.Entidad === p.AtributoLista.Entidad ) < 0 ) {
                if ( item[p.Id] !== null) ids = ids + item[p.Id] + '&';
              }
          });
          // Si hay Ids faltantes los añade a una lista de bpsqueuda
          if (ids !== '') {
            buscar.push( p.AtributoLista.Entidad + '|' + ids );
          }
        }
      });

      if (buscar.length > 0) {
        const tasks$ = [];
        buscar.forEach( s => {
            const entidad = s.split('|')[0];
            const lids =  s.split('|')[1].split('&');
            tasks$.push( this.cliente.PairListbyId(lids, entidad).first());
        });
        Observable.forkJoin(...tasks$).subscribe(results => {
          let idx = 0;
          results.forEach(element => {
            const entidad = buscar[idx].split('|')[0];
            element.forEach( (item: ValorListaOrdenada) => {

              if (this.ListaIds.findIndex(x =>  x.Id === item.Id &&
                x.Entidad === entidad ) < 0 )
              this.ListaIds.push( new TextoDesdeId(entidad, item.Id, item.Texto ));
            });
            idx ++;
          });
          this.VinculaTextpIdentificadores(pagina);
         });
      } else {
        this.VinculaTextpIdentificadores(pagina);
      }
    }

    private VinculaTextpIdentificadores(pagina: Paginado<any>): void {
      this.paginaActual = pagina;
      this.NuevaPaginaisponible.next(this.paginaActual);
    }

    private ObtenerPaginaRelacional (consulta: Consulta) {
        this.LlamadaAPI.next(true);
        this.cliente.PageRelated(this.TipoOrigenId, this.OrigenId , consulta, this.entidad).pipe(
            debounceTime(500),
        ).subscribe( x => {
            this.consultaActual = consulta;
            this.BuscaTextoDeIdentificadores(x);
        }, (error) => {
          this.handleHTTPError(error, 'pagina-resultados', '');
        },
        () => {
          this.LlamadaAPI.next(false);
         });
    }


    public TypeAhead(lista: AtributoLista, texto: string): Observable<ValorListaOrdenada[]> {
      return this.cliente.PairListTypeAhead(lista, texto);
    }


    private ObtenerPagina (consulta: Consulta) {
      this.LlamadaAPI.next(true);
      this.cliente.Page(consulta, this.entidad).pipe(
          debounceTime(500),
      ).subscribe( x => {
          this.consultaActual = consulta;
          this.BuscaTextoDeIdentificadores(x);
      }, (error) => {
        this.handleHTTPError(error, 'pagina-resultados', '');
      },
      () => {
        this.LlamadaAPI.next(false);
       });
    }

    // --------------------------------------------------------------------------------------------------------------
    // --------------------------------------------------------------------------------------------------------------

    // Eventos Metadatos
    // ------------------------------------------------------
    ObtieneMetadatosDisponibles(): Observable<MetadataInfo> {
        return this.MetdatosDisponibles.asObservable();
    }


    // Setters metadatos
    // ------------------------------------------------------

    EstableceMetadatos(metadatos: MetadataInfo): void {
      // Ontiene las traducciones para los encabezados y los asigna a las propeidaes
      // antes de establcerlas en el observable
      this.ts.get('entidades.propiedades.' + this.entidad.toLowerCase()).pipe(first())
      .subscribe( r => {
        this.metadatos = metadatos;
        this.metadatos.Propiedades.forEach( p => {
          if (r[p.Nombre]) {
            p.NombreI18n = r[p.Nombre];
          } else {
            p.NombreI18n = p.Nombre;
          }
        });
        this.MetdatosDisponibles.next(this.metadatos);
      });

    }


    // --------------------------------------------------------------------------------------------------------------
    // --------------------------------------------------------------------------------------------------------------

    // Eventos búsqueda
    // ------------------------------------------------------

    ObtieneFiltrosEliminados(): Observable<Propiedad> {
        return this.EliminaFiltroSubject.asObservable();
    }

    ObtieneEliminarTodos(): Observable<any> {
        return this.EliminaTodosFiltrosSubject.asObservable();
    }

    ObtieneFiltros(): Observable<any> {
        return this.FiltrosSubject.asObservable();
    }

    ObtieneFiltrosValidos(): Observable<any> {
        return this.FiltrosValidosSubject.asObservable();
    }


    // Setters búsqueda
    // ------------------------------------------------------

    EstablecerFiltrosValidos(): void {
        this.FiltrosValidosSubject.next(true);
    }

    InvalidarFiltro(filtro: FiltroConsulta): void {
        const index = this.filtros.indexOf(filtro, 0);
            if (index > -1) {
              this.filtros.splice(index, 1);
              this.FiltrosSubject.next(this.filtros);
            }
    }

    EliminarFiltro(config: Propiedad) {
        this.EliminaFiltroSubject.next(config);

        const filtro = this.filtros.filter( x => x.Id === config.Id )[0];
        if (filtro) {
            const index = this.filtros.indexOf(filtro, 0);
            if (index > -1) {
              this.filtros.splice(index, 1);
              this.FiltrosSubject.next(this.filtros);
            }
        }
    }

    EliminarTodosFiltros() {
        this.EliminaTodosFiltrosSubject.next(true);
        this.filtros = [];
        this.FiltrosSubject.next(this.filtros);
    }


    AgregarFiltro(filtro: FiltroConsulta) {
        const index = this.filtros.indexOf(filtro, 0);
        if (index > -1) {
          this.filtros.splice(index, 1);
        }
        this.filtros.push(filtro);
        this.FiltrosSubject.next(this.filtros);
    }


    OnDestry(): void {
      this.onDestroy$.next();
    }

}
