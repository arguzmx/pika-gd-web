import { AppLogService } from './../../../@pika/servicios/app-log/app-log.service';
import { Consulta } from './../../../@pika/consulta/consulta';
import { ColumnaTabla } from './../model/columna-tabla';
import { environment } from './../../../../environments/environment.prod';
import { FiltroConsulta } from './../../../@pika/consulta/filtro-consulta';
import { BehaviorSubject, Observable, Subscription } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PikaApiService } from '../../../@pika/pika-api';
import { MetadataInfo, Propiedad } from '../../../@pika/metadata';
import { Paginado } from '../../../@pika/consulta';
import { debounceTime } from 'rxjs/operators';

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

    private metadatos: MetadataInfo;

    // Subjects relacionados con la gestión de configuración de búsueda
    private EliminaFiltroSubject = new BehaviorSubject(null);
    private EliminaTodosFiltrosSubject = new BehaviorSubject(null);
    private FiltrosSubject = new BehaviorSubject([]);
    private FiltrosValidosSubject = new BehaviorSubject(false);

    // Subject relacionados con la gestion de metadatos
    private MetdatosDisponibles = new BehaviorSubject(null);

    // Subject relacionados con el paginado de datos
    private NuevaPaginaisponible = new BehaviorSubject(null);


    // Subject relacionados con la gestion mensajes en la UI
    private Notificacion = new BehaviorSubject(null);

    // Control de la suscripcion para obetenr los metadatos
    private metadataSuscription: Subscription;

    // Contructor 
    constructor(private route: ActivatedRoute, private applog: AppLogService,
      private http: HttpClient) {
      this.Init();
    }

    // al iniciar
    Init(): void {
        this.route.queryParams.subscribe(
            (params) => {
              if (params[environment.editorToken]) {
                this.entidad = params[environment.editorToken];
              }
              if (this.entidad !== '') {
                this.cliente = new PikaApiService(environment.apiUrl, this.entidad, this.http);
                this.metadataSuscription = this.cliente.GetMetadata().subscribe(x => {
                    this.EstableceMetadatos(x);
                }, (error) => {
                    this.applog.Falla('', `Error al obtener los metadatos de la entidad ${this.entidad}`);
                    this.metadataSuscription.unsubscribe();
                }, () => {
                    this.metadataSuscription.unsubscribe();
                } );
              } else {
                this.applog.Falla('', 'Error al obtener la entidad de ruta');
              }
            },
            (error) => {
              this.applog.Falla('', 'Error al obtener el parámetro de ruta');
            },
          );
    }


    // --------------------------------------------------------------------------------------------------------------
    // --------------------------------------------------------------------------------------------------------------

    // Eventos paginado de datos
    // ------------------------------------------------------
    ObtieneNuevaPaginaisponible(): Observable<Paginado<any>> {
        return this.NuevaPaginaisponible.asObservable();
    }


    NuevaConsulta(consulta: Consulta): void {
        this.cliente.Page(consulta).pipe(
            debounceTime(500),
        ).subscribe( x => {
            this.paginaActual = x;
            this.consultaActual = consulta;
            this.NuevaPaginaisponible.next(this.paginaActual);
        }, (e) => {
            this.applog.Falla('', `Error al obtener la página de resulatdos: ${e}`);
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
