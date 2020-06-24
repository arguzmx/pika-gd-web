import { TraduccionEntidad } from './../../../@core/comunes/traduccion-entidad';
import { TranslateService } from '@ngx-translate/core';
import { AppLogService } from './../../../@pika/servicios/app-log/app-log.service';
import { Consulta } from './../../../@pika/consulta/consulta';
import { ColumnaTabla } from './../model/columna-tabla';
import { environment } from './../../../../environments/environment.prod';
import { FiltroConsulta } from './../../../@pika/consulta/filtro-consulta';
import { BehaviorSubject, Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpResponseBase } from '@angular/common/http';
import { PikaApiService } from '../../../@pika/pika-api';
import { MetadataInfo, Propiedad } from '../../../@pika/metadata';
import { Paginado } from '../../../@pika/consulta';
import { debounceTime, first } from 'rxjs/operators';
import { ResultadoAPI, TipoOperacionAPI } from '../../../@pika/pika-api/resultado-api';
import { TarjetaVisible } from '../model/tarjeta-visible';


@Injectable()
    export class EditorService {

    // Entidad actual recibida vía el ruteo
    private entidad: string;

    // Filtros de búsqueda disponbiles para el editor actual
    private filtros: FiltroConsulta[] = [];
    private consultaActual: Consulta = null;
    private paginaActual: Paginado<any> = null;

    // CLiente APi PIKA
    public cliente: PikaApiService<any, string>;

    public metadatos: MetadataInfo = null;

    // Subjects relacionados con la gestión de configuración de búsueda
    private EliminaFiltroSubject = new BehaviorSubject(null);
    private EliminaTodosFiltrosSubject = new BehaviorSubject(null);
    private FiltrosSubject = new BehaviorSubject([]);
    private FiltrosValidosSubject = new BehaviorSubject(false);

    // Subject relacionados con la gestion de metadatos
    private MetdatosDisponibles = new BehaviorSubject(null);

    // Subject relacionados con llamadas a meetodos de API
    private NuevaPaginaisponible = new BehaviorSubject(null);

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
      private ts: TranslateService,
      private router: Router,
      private route: ActivatedRoute,
      private applog: AppLogService,
      private http: HttpClient) {
      this.Init();
    }

    // al iniciar
    Init(): void {
        this.route.queryParams
        .subscribe(
            (params) => {
              if (params[environment.editorToken]) {
                this.entidad = params[environment.editorToken];
              }
              if (this.entidad !== '') {
                this.LlamadaAPI.next(false);
                this.cliente = new PikaApiService(environment.apiUrl, this.entidad, this.router, this.http);
                this.cliente.GetMetadata().pipe(first()).subscribe(x => {
                    this.EstableceMetadatos(x);
                }, (error) => {
                    this.handleHTTPError(error, 'metadatos', '');
                },
                  () => {
                    this.LlamadaAPI.next(false);
                });
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

    // --------------------------------------------------------------------------------------------------------------
    // --------------------------------------------------------------------------------------------------------------

    // Eventos UI
    // ------------------------------------------------------
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
       this.cliente.Put(Id, entidad).pipe(
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
     this.cliente.Post(entidad).pipe(
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
     this.cliente.Delete([Id]).pipe(
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
      this.LlamadaAPI.next(true);
        this.cliente.Page(consulta).pipe(
            debounceTime(500),
        ).subscribe( x => {
            this.paginaActual = x;
            this.consultaActual = consulta;
            this.NuevaPaginaisponible.next(this.paginaActual);
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
        this.metadatos = metadatos;
        this.MetdatosDisponibles.next(this.metadatos);
    }


  // Obtiene las columas disponibles para mostrase en la tabla
  public GetColumnasTabla(): ColumnaTabla[] {
    const columnas: ColumnaTabla[] = [];
    for (let i = 0; i < this.metadatos.Propiedades.length; i++) {
      const c = this.metadatos.Propiedades[i];
      const t = c.AtributoTabla;

      if (t) {
        if (t.Visible || t.Alternable) {
          columnas.push({
            Id: c.Id,
            Nombre: c.Nombre,
            Ordenable: c.Ordenable,
            Buscable: c.Buscable,
             Visible: t.Visible,
             Alternable: t.Alternable,
             Tipo: c.TipoDatoId,
          });
        }

      }
    }
    return columnas;
  }


  // Otiene los campos que son factibles para realizar búsqueda
  public GetCamposFlitrables(): Propiedad[] {
    const columnas: Propiedad[] = [];
    for (let i = 0; i < this.metadatos.Propiedades.length; i++) {
      const c = this.metadatos.Propiedades[i];
      if (c.Buscable) {
        columnas.push(c);
      }
    }
    return columnas;
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


}
