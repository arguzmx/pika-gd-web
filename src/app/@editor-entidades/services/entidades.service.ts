import { environment } from './../../../environments/environment.prod';
import { AppConfig } from './../../app-config';
import { PADMINISTRAR, PLEER, PELIMINAR, PESCRIBIR, PEJECUTAR } from './../../@pika/seguridad/permiso-acl';
import { Propiedad, IProveedorReporte, PermisoAplicacion, PDENEGARACCESO } from '../../@pika/pika-module';
import { Observable, BehaviorSubject, AsyncSubject, forkJoin } from 'rxjs';
import { CacheEntidadesService } from './cache-entidades.service';
import { Injectable } from '@angular/core';
import { MetadataInfo, tString } from '../../@pika/pika-module';
import { PikaApiService } from '../../@pika/pika-module';
import { HttpClient, HttpResponseBase } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { TraduccionEntidad } from '../../@pika/pika-module';
import { AppLogService } from '../../@pika/pika-module';
import { TextoDesdeId } from '../model/texto-desde-id';
import { Consulta, Paginado } from '../../@pika/pika-module';
import { ValorListaOrdenada } from '../../@pika/pika-module';
import { AtributoLista } from '../../@pika/pika-module';
import { debounceTime, first } from 'rxjs/operators';
import { SesionQuery } from '../../@pika/pika-module';
import { DescriptorNodo } from '../model/descriptor-nodo';
import { Acciones } from '../../@pika/pika-module';
import { EventoArbol, EventoContexto } from '../model/eventos-arbol';

export const CONTEXTO = 'CONTEXTO';
export const SESION = 'SESION';
export const GLOBAL = 'GLOBAL';

export enum EventosFiltrado {
  Ninguno, EliminarFiltros,
}


@Injectable()
export class EntidadesService {
  // Almacena las traudcciones de un nombre de instancoi para un identificador
  public ListaIds: TextoDesdeId[] = [];


  public InstanciasObjectos: any[] = [];

  // CLiente APi PIKA
  public cliente: PikaApiService<any, string>;

    private BusContexto = new BehaviorSubject(null);
  private BusArbol = new BehaviorSubject(null);
  private BusFiltros = new BehaviorSubject<EventosFiltrado>(EventosFiltrado.Ninguno);

  constructor(
    private app: AppConfig,
    private sesion: SesionQuery,
    private cache: CacheEntidadesService, private http: HttpClient,
    private ts: TranslateService, private router: Router, private applog: AppLogService) {
    this.Init();
  }

  private Init(): void {
    this.cliente = new PikaApiService(this.app, this.sesion, this.http);
  }

  public Destroy(): void { }

  public NewGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0,
        v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  PermitirAccesoACL(p: PermisoAplicacion) {
    if (p.NegarAcceso) return false;
    // NO importa que otros permisos teaga como es la UI al menos debe tener leer
    // si no tiene leer no puede consultar la información en pantalla
    if (p.Leer) return true;
  }


  public permisoSinAcceso: PermisoAplicacion = {
    DominioId: '',
    AplicacionId: '',
    ModuloId: '',
    TipoEntidadAcceso: '',
    EntidadAccesoId: '',
    NegarAcceso: false,
    Leer: false,
    Escribir: false,
    Eliminar: false,
    Admin: false,
    Ejecutar: false,
    Mascara: 0,
  };

  public permisoAdmin: PermisoAplicacion = {
    DominioId: '',
    AplicacionId: '',
    ModuloId: '',
    TipoEntidadAcceso: '',
    EntidadAccesoId: '',
    NegarAcceso: false,
    Leer: true,
    Escribir: true,
    Eliminar: true,
    Admin: true,
    Ejecutar: true,
    Mascara: 65535,
  };

  // Getson de permisos
  ObtienePermiso(appid: string, moduloId: string ): PermisoAplicacion {

    if(!environment.production) {
      console.debug(this.sesion.ACL);
    }
    

    if (this.sesion.ACL.EsAdmin) {
        return this.permisoAdmin;
    } else {
      const acl =  this.sesion.ACL.Permisos.find(x => x.ModuloId === moduloId
        && x.AplicacionId === appid);

      const permiso = this.permisoSinAcceso;

      if (acl) {
        permiso.NegarAcceso = (acl.Mascara & PDENEGARACCESO) > 0;
        permiso.Admin = (acl.Mascara & PADMINISTRAR) > 0;
        permiso.Leer = (acl.Mascara & PLEER) > 0;
        permiso.Eliminar = (acl.Mascara & PELIMINAR) > 0;
        permiso.Escribir = (acl.Mascara & PESCRIBIR) > 0;
        permiso.Ejecutar = (acl.Mascara & PEJECUTAR) > 0;
        permiso.Mascara = acl.Mascara;
      }

      return permiso;
    }
  }


  // Getsion de jerarquias
  // ---------------------------------------
  // ---------------------------------------
  ObtieneEventosArbol(): Observable<EventoArbol> {
    return this.BusArbol.asObservable();
  }

  EmiteEventoArbol(evt: EventoArbol): void {
    this.BusArbol.next(evt);
  }


  public OntieneRaicesHie(HieId: string, tipo: string): Observable<any[]> {
    const subject = new AsyncSubject<any>();
    this.cliente.GetHieRaices(HieId, tipo).pipe(
      debounceTime(500),
    ).subscribe(resultado => {
      subject.next(resultado);
    }, (error) => {
      this.handleHTTPError(error, tipo, '');
      subject.next([]);
    }, () => {
      subject.complete();
    });
    return subject;
  }

  public OntieneHijosHie(HieId: string, Id: string, tipo: string): Observable<any[]> {
    const subject = new AsyncSubject<any>();
    this.cliente.GetHieHijos(HieId, Id, tipo).pipe(
      debounceTime(500),
    ).subscribe(resultado => {
      subject.next(resultado);
    }, (error) => {
      this.handleHTTPError(error, tipo, '');
      subject.next([]);
    }, () => {
      subject.complete();
    });
    return subject;
  }



  public ObtieneDescriptorNodo(tipo: string): Observable<DescriptorNodo> {
    const subject = new AsyncSubject<any>();
    this.ObtieneMetadatos(tipo).pipe(first())
      .subscribe(m => {

        const valor: DescriptorNodo = { PropId: null, PropNombre: null, PropIdraiz: '', PropIdPadre: '' };

        m.Propiedades.forEach(p => {
          if (p.EsIdJerarquia) {
            valor.PropId = p.Id;
          }
          if (p.EsTextoJerarquia) {
            valor.PropNombre = p.Id;
          }
          if (p.EsIdRaizJerarquia) {
            valor.PropIdraiz = p.Id;
          }
          if (p.EsFiltroJerarquia) {
            valor.PropIdPadre = p.Id;
          }
        });

        if (valor.PropId === null ||
          valor.PropNombre === null) return null;

        subject.next(valor);

      }, (error) => {
        this.handleHTTPError(error, tipo, '');
        subject.next(null);
      }, () => {
        subject.complete();
      });
    return subject;
  }

  // Propiedes contextuales
  // ---------------------------------------
  // ---------------------------------------
  public SetCachePropiedadContextual(propiedad: string, origen: string, tranid: string, valor: any): void {
    const key = this.cache.ClaveValorContextual(origen, propiedad, tranid);
    this.cache.set(key, valor);
    this.EmiteEventoContexto({ Origen: key, Valor: valor });
  }

  public GetPropiedadCacheContextual(propiedad: string, origen: string, tranid: string): any {
    origen = origen.toUpperCase();
    switch (origen) {
      case CONTEXTO:
        const key = this.cache.ClaveValorContextual(origen, propiedad, tranid);
        // console.log(key);
        this.printCache();
        if (this.cache.has(key)) return this.cache.get(key);
        break;

      case SESION:
      case GLOBAL:
        // console.log(propiedad + " :GS");
        const valor = this.sesion.sesion()[propiedad];
        if (valor) return valor;
        break;
    }
    return null;
  }

  public printCache(): void {
    this.cache.print();
  }


  // Cache de instancias
  // ---------------------------------------
  // ---------------------------------------

  public SetCacheInstanciaEntidad(tipo: string, id: string, entidad: any): void {
    const key = this.cache.ClaveInstancia(tipo, id);
    this.cache.set(key, entidad);
  }

  public GetCacheInstanciaAntidad(tipo: string, id: string): any {
    const key = this.cache.ClaveInstancia(tipo, id);
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    return null;
  }



  // Manejo CRUD de entidades
  // ---------------------------------------
  // ---------------------------------------

  public ObtenerIdEliminarLogicoEntidad(tipo: string): string {
    const m: MetadataInfo = this.cache.get(this.cache.ClaveMetadatos(tipo));
    if (m.ElminarLogico) {
      return m.ColumaEliminarLogico;
    }
    return '';
  }

  public ObtenerIdEntidad(tipo: string, entidad: any): string {
    const m: MetadataInfo = this.cache.get(this.cache.ClaveMetadatos(tipo));
    const index = m.Propiedades.findIndex(x => x.EsIdRegistro === true);

    if (index >= 0) {
      return String(entidad[m.Propiedades[index].Id]);
    }

    if (entidad['Id']) return entidad['Id'];

    if (entidad['id']) return entidad['id'];

    return '';
  }

  public ObtenerNombreEntidad(tipo: string, entidad: any): string {
    const key = this.cache.ClaveMetadatos(tipo);
    const m: MetadataInfo = this.cache.get(key);
    const index = m.Propiedades.findIndex(x => x.Etiqueta === true);
    if (index >= 0) {
      return String(entidad[m.Propiedades[index].Id]);
    }

    if (entidad['Nombre']) return entidad['Nombre'];

    if (entidad['Descripcion']) return entidad['Descripcion'];

    return '';
  }

  public EliminarEntidad(tipo: string, id: string, nombre: string): Observable<boolean> {
    const subject = new AsyncSubject<any>();
    this.cliente.Delete([id], tipo).pipe(
      debounceTime(500),
    ).subscribe(resultado => {
      this.applog.ExitoT('editor-pika.mensajes.ok-entidad-del', null, { nombre: nombre });
      subject.next(true);
    }, (error) => {
      this.handleHTTPError(error, tipo, '');
      subject.next(false);
    }, () => {
      subject.complete();
    });

    return subject;
  }

  ActualizarEntidad(tipo: string, Id: string, entidad: any): Observable<any> {
    const subject = new AsyncSubject<any>();
    const nombre = this.ObtenerNombreEntidad(tipo, entidad);
    this.cliente.Put(Id, entidad, tipo).pipe(
      debounceTime(500),
    ).subscribe(resultado => {

      this.applog.ExitoT('editor-pika.mensajes.ok-entidad-act', null, { nombre: nombre });
      subject.next(entidad);

    }, (err) => {
      this.handleHTTPError(err, tipo, nombre);
      subject.next(null);

    }, () => {
      subject.complete();
    });

    return subject;
  }


  CreaEntidad(tipo: string, entidad: any): Observable<any> {
    const subject = new AsyncSubject<any>();
    const nombre = this.ObtenerNombreEntidad(tipo, entidad);
    this.cliente.Post(entidad, tipo).pipe(
      debounceTime(500),
    ).subscribe(resultado => {

      this.applog.ExitoT('editor-pika.mensajes.ok-entidad-add', null, { nombre: nombre });
      subject.next(resultado);

    }, (error) => {
      this.handleHTTPError(error, tipo, '');
      subject.next(null);
    }, () => {
      subject.complete();
    });

    return subject;
  }


  CreaEntidadMiembro(tipo: string, idPadre: string, idMiembros: string[]): Observable<any> {
    const subject = new AsyncSubject<any>();
    this.cliente.PostMiembros(idPadre, idMiembros, tipo).pipe(
      debounceTime(500),
    ).subscribe(resultado => {
      this.applog.ExitoT('editor-pika.mensajes.ok-entidad-add', null, { nombre: '' });
      subject.next(resultado);
    }, (error) => {
      this.handleHTTPError(error, tipo, '');
      subject.next(null);
    }, () => {
      subject.complete();
    });

    return subject;
  }

  public EliminarEntidadMiembros(tipo: string, idPadre: string, idMiembros: string[]): Observable<boolean> {
    const subject = new AsyncSubject<any>();
    this.cliente.DeleteMiembros(idPadre, idMiembros, tipo).pipe(
      debounceTime(500),
    ).subscribe(resultado => {
      this.applog.ExitoT('editor-pika.mensajes.ok-entidad-del', null, { nombre: '' });
      subject.next(true);
    }, (error) => {
      this.handleHTTPError(error, tipo, '');
      subject.next(false);
    }, () => {
      subject.complete();
    });

    return subject;
  }

  // Eventos filtros
  // ---------------------------------------
  // ---------------------------------------

  ObtieneEventosFiltros(): Observable<EventosFiltrado> {
    return this.BusFiltros.asObservable();
  }

  EmiteEventoFiltros(ev: EventosFiltrado): void {
    this.BusFiltros.next(ev);
  }

 

  // Eventos interproceso
  // ---------------------------------------
  // ---------------------------------------

  ObtieneAventosContexto(): Observable<EventoContexto> {
    return this.BusContexto.asObservable();
  }

  EmiteEventoContexto(item: EventoContexto): void {
    this.BusContexto.next(item);
  }




  // Manuejo de listas
  // ---------------------------------------------------------------
  // ---------------------------------------------------------------

  public ValoresLista(ids: string[], entidad: string) {
    return this.cliente.PairListbyId(ids, entidad);
  }

  public TypeAhead(lista: AtributoLista, texto: string): Observable<ValorListaOrdenada[]> {
    return this.cliente.PairListTypeAhead(lista, texto);
  }


  SolicitarLista(lista: AtributoLista, consulta: Consulta): Observable<AtributoLista> {
    let query = '';
    consulta.FiltroConsulta.forEach(x => query = query + `${x.Propiedad}-${x.Operador}-${x.Valor}`);
    const key = this.cache.ClaveLista(lista.Entidad, query);
    const subject = new AsyncSubject<AtributoLista>();
    if (this.cache.has(key)) {
      lista.Valores = this.cache.get(key);
      subject.next(lista);
      subject.complete();
    } else {
      this.cliente.PairList(lista, consulta).pipe(debounceTime(500), first())
        .subscribe(valores => {
          lista.Valores = valores;
          subject.next(lista);
          this.cache.set(key, valores);
        },
          (err) => { subject.next(null); },
          () => {
            subject.complete();
          });
    }
    return subject;
  }

  public ObtieneEntidadUnica(tipoentidad: string, identidad: string): Observable<any> {
    const subject = new AsyncSubject<any>();

    const key = this.cache.ClaveEntidad(tipoentidad, identidad);

    if (this.cache.has(key)) {
      subject.next(this.cache.get(key));
      subject.complete();
    } else {
      this.cliente.Get(identidad, tipoentidad).pipe(first())
        .subscribe(entidad => {
          this.cache.set(key, entidad);
          subject.next(entidad);
        },
          (error) => {
            this.handleHTTPError(error, 'entidad', '');
            subject.next(null);
          },
          () => { subject.complete(); });
    }

    return subject;
  }

  // Obtiene los metadatos de un tipo de  entidad
  public ObtieneMetadatos(tipoentidad: string): Observable<MetadataInfo> {
    const subject = new AsyncSubject<MetadataInfo>();
    const key = this.cache.ClaveMetadatos(tipoentidad);

    if (this.cache.has(key)) {
      subject.next(this.cache.get(key));
      subject.complete();
    } else {
      this.cliente.GetMetadata(tipoentidad).pipe(first())
        .subscribe(m => {
          this.ProcesaMetadatos(tipoentidad, m).pipe(first()).subscribe(procesados => {
            this.cache.set(key, procesados);
            subject.next(procesados);
          }, (err) => {
            subject.next(m);
          });
        },
          (error) => {
            this.handleHTTPError(error, 'metadatos', '');
            subject.next(null);
          },
          () => { subject.complete(); });
    }

    return subject;
  }

  // Ontiene las traducciones para los encabezados y los asigna a las propeidaes
  private ProcesaMetadatos(entidad: string, metadatos: MetadataInfo): Observable<MetadataInfo> {
    const subject = new AsyncSubject<MetadataInfo>();
    this.ts.get('entidades.propiedades.' + entidad.toLowerCase()).pipe(first())
      .subscribe(r => {

        const pcatalogo = this.ObtieneCamposCatalogo(metadatos);
        pcatalogo.forEach(p => {
          metadatos.Propiedades.push(p);
        });

        metadatos.Propiedades.forEach(p => {
          if (r[p.Nombre]) {
            p.NombreI18n = r[p.Nombre];
          } else {
            p.NombreI18n = p.Nombre;
          }
        });
        subject.next(metadatos);
      }, (err) => {
        subject.next(metadatos);
      }, () => {
        subject.complete();
      });
    return subject;
  }

  // realiza una consulta de pagina relacional
  public ObtenerEntidadUnica(tipo: string, id: string): Observable<any> {

    const subject = new AsyncSubject<any>();

    this.cliente.Get(id, tipo).pipe(
      debounceTime(500), first(),
    ).subscribe(data => {
      subject.next(data);
      subject.complete();
    }, (error) => {
      // this.handleHTTPError(error, 'pagina-resultados', '');
      subject.next(null);
      subject.complete();
    },
      () => {
      });

    return subject;
  }


  // realiza una consulta de pagina relacional
  public ObtenerPaginaRelacional(TipoOrigen: string, OrigenId: string, Entidad: string,
    consulta: Consulta): Observable<Paginado<any>> {

    const subject = new AsyncSubject<Paginado<any>>();

    this.cliente.PageRelated(TipoOrigen, OrigenId, consulta, Entidad).pipe(
      debounceTime(500), first(),
    ).subscribe(data => {

      this.BuscaTextoDeIdentificadores(Entidad, data).pipe(first())
        .subscribe(isok => {
          subject.next(data);
          subject.complete();
        });
    }, (error) => {
      this.handleHTTPError(error, 'pagina-resultados', '');
      subject.next(null);
      subject.complete();
    },
      () => {
      });

    return subject;
  }


  // realiza una consulta de pagina no relacional
  public ObtenerPagina(Entidad: string,
    consulta: Consulta): Observable<Paginado<any>> {

    const subject = new AsyncSubject<Paginado<any>>();

    this.cliente.Page(consulta, Entidad).pipe(
      debounceTime(500), first(),
    ).subscribe(data => {
      this.BuscaTextoDeIdentificadores(Entidad, data).pipe(first())
        .subscribe(isok => {
          subject.next(data);
        });
      subject.next(data);
      subject.complete();
    }, (error) => {
      this.handleHTTPError(error, 'pagina-resultados', '');
      subject.next(null);
      subject.complete();
    },
      () => {
      });

    return subject;
  }


  public ObtieneCamposCatalogo(metadata: MetadataInfo): Propiedad[] {
    const propiedades: Propiedad[] = [];

    metadata.CatalogosVinculados.forEach(c => {
      if (metadata.Propiedades
        .findIndex(x => x.Id === c.PropiedadReceptora) >= 0) {
        return;
      }

      let indice = 1000;
      const p: Propiedad = {
        Id: c.PropiedadReceptora,
        Nombre: c.PropiedadReceptora,
        NombreI18n: c.PropiedadReceptora,
        TipoDatoId: tString,
        ValorDefault: null,
        IndiceOrdenamiento: indice,
        Buscable: false,
        Ordenable: false,
        Visible: true,
        EsIdClaveExterna: false,
        EsIdRegistro: false,
        EsIdJerarquia: false,
        EsTextoJerarquia: false,
        EsIdRaizJerarquia: false,
        EsFiltroJerarquia: false,
        Requerido: false,
        Autogenerado: false,
        EsIndice: false,
        ControlHTML: null,
        TipoDato: null,
        ValidadorTexto: null,
        ValidadorNumero: null,
        Atributos: null,
        AtributoLista: {
          DatosRemotos: true,
          Entidad: c.EntidadCatalogo,
          OrdenarAlfabetico: true,
          Default: '',
          PropiedadId: c.IdCatalogoMap,
          TypeAhead: false,
        },
        AtributosVistaUI: [{
          PropiedadId: c.IdCatalogoMap,
          Control: 'checkboxgroupeditor',
          Accion: Acciones.addupdate,
          Plataforma: 'web',
        }],
        AtributosEvento: [],
        ValoresLista: [],
        OrdenarValoresListaPorNombre: true,
        Valor: null,
        MostrarEnTabla: true,
        AlternarEnTabla: true,
        IndiceOrdenamientoTabla: 1000,
        Contextual: false,
        IdContextual: '',
        Etiqueta: false,
        CatalogoVinculado: true,
      };
      propiedades.push(p);
      indice++;
    });

    return propiedades;
  }



  private BuscaIdsParaLista(p: Propiedad, pagina: Paginado<any>): string[] {
    const buscar: string[] = [];
    let ids = '';
    if (pagina && pagina.Elementos) {
      // Recorre todos los elementos de la misma propiedad y obtiene
      // los Ids inexitsnetes en el diccionario
      pagina.Elementos.forEach(item => {
        if (this.ListaIds.findIndex(x => x.Id === item[p.Id] &&
          x.Entidad === p.AtributoLista.Entidad) < 0) {
          if (item[p.Id] !== null) ids = ids + item[p.Id] + '&';
        }
      });
      // Si hay Ids faltantes los añade a una lista de bpsqueuda
      if (ids !== '') {
        buscar.push(p.AtributoLista.Entidad + '|' + ids);
      }
    }
    return buscar;
  }

  private BuscaIdsParaCatalogos(p: Propiedad, pagina: Paginado<any>): string[] {
    const buscar: string[] = [];
    let ids = '';
    // Recorre todos los elementos de la misma propiedad y obtiene
    // los Ids inexitsnetes en el diccionario
    pagina.Elementos.forEach(item => {
      if (this.ListaIds.findIndex(x => x.Id === item[p.Id] &&
        x.Entidad === p.AtributoLista.Entidad) < 0) {
        if (item[p.Id] !== null) {
          item[p.Id].forEach(element => {
            ids = ids + item[p.Id] + '&';
          });
        }
      }
    });
    // Si hay Ids faltantes los añade a una lista de bpsqueuda
    if (ids !== '') {
      buscar.push(p.AtributoLista.Entidad + '|' + ids);
    }
    return buscar;
  }

  private BuscaTextoDeIdentificadores(tipoentidad: string, pagina: Paginado<any>):
    Observable<boolean> {
    const subject = new AsyncSubject<boolean>();
    const key = this.cache.ClaveMetadatos(tipoentidad);
    if (this.cache.has(key)) {
      const metadata: MetadataInfo = this.cache.get(key);
      const buscar: string[] = [];

      // Inicia el proes deo busqeda
      metadata.Propiedades.forEach(p => {
        // realiza el análisis si la priedad es atributlo de lista

        if (p.CatalogoVinculado) {
          this.BuscaIdsParaCatalogos(p, pagina).forEach(item => buscar.push(item));
        } else {
          if (p.AtributoLista && p.AtributoLista.DatosRemotos && p.AtributoLista.Entidad !== '') {
            this.BuscaIdsParaLista(p, pagina).forEach(item => buscar.push(item));
          }
        }
      });

      if (buscar.length > 0) {
        // LLama a la API para obtener todos los identiicadores
        const tasks$ = [];
        buscar.forEach(s => {
          const entidad = s.split('|')[0];
          const lids = s.split('|')[1].split('&');
          tasks$.push(this.cliente.PairListbyId(lids, entidad).pipe(first()));
        });

        // resuelve el observable al finalizar todos los threads
        forkJoin(...tasks$).subscribe(results => {
          let idx = 0;
          results.forEach(element => {
            const entidad = buscar[idx].split('|')[0];
            element.forEach((item: ValorListaOrdenada) => {
              if (this.ListaIds.findIndex(x => x.Id === item.Id &&
                x.Entidad === entidad) < 0)
                this.ListaIds.push(new TextoDesdeId(entidad, item.Id, item.Texto));
            });
            idx++;
          });
          subject.next(true);
        }, (err) => {
          subject.next(false);
        }, () => {
          subject.complete();
        });
      } else {
        subject.next(true);
        subject.complete();
      }

    } else {
      subject.next(true);
      subject.complete();
    }

    return subject;
  }


  public GetReport(entidad: string, reporte: IProveedorReporte, filename?: string) {
    this.cliente.GetReport(entidad, reporte, filename);
  }

  // Proces alos errores de API
  private handleHTTPError(error: Error, modulo: string, nombreEntidad: string): void {
    if (error instanceof HttpResponseBase) {
      if (error.status === 401) {
        // this.router.navigate(['/acceso/login']);
      } else {
        this.MuestraErrorHttp(error, modulo, nombreEntidad);
      }
    }
  }

  private MuestraErrorHttp(error: Error, modulo: string, nombreEntidad: string): void {
    const traducciones: string[] = [];
    traducciones.push('entidades.' + modulo);

    this.ts.get(traducciones)
      .pipe(first())
      .subscribe(t => {

        let trad: TraduccionEntidad = null;
        if ((t['entidades.' + modulo] !== 'entidades.' + modulo)
          && t['entidades.' + modulo].indexOf('|') > 0) {
          trad = new TraduccionEntidad(t['entidades.' + modulo]);
        } else {
          trad = new TraduccionEntidad(modulo + '|' + modulo + 's|' + '|');
        }

        if (error instanceof HttpResponseBase) {
          switch (error.status) {

            case 400:
              this.applog.FallaT('editor-pika.mensajes.err-datos-erroneos', null,
                { entidad: trad.singular, prefijo: trad.prefijoSingular });
              break;

            case 404:
              this.applog.FallaT('editor-pika.mensajes.err-datos-noexiste', null,
                { entidad: trad.singular, prefijo: trad.prefijoSingular });
              break;

            case 409:
              this.applog.FallaT('editor-pika.mensajes.err-datos-conflicto', null,
                { entidad: trad.singular, prefijo: trad.prefijoSingular });
              break;

            case 500:
              this.applog.FallaT('editor-pika.mensajes.err-datos-servidor', null,
                { entidad: trad.singular, prefijo: trad.prefijoSingular, error: error.statusText });
              break;
          }
        }
      });

  }




}
