import { FiltroConsultaPropiedad } from './../../@pika/consulta/filtro.-consulta-propiedad';
import { DocumentoPlantilla } from './../../@pika/metadata/documeto-plantilla';
import { environment } from './../../../environments/environment.prod';
import { AppConfig } from './../../app-config';
import { PADMINISTRAR, PLEER, PELIMINAR, PESCRIBIR, PEJECUTAR, PermisoACL } from './../../@pika/seguridad/permiso-acl';
import { Propiedad, IProveedorReporte, PermisoAplicacion, PDENEGARACCESO, RespuestaComandoWeb } from '../../@pika/pika-module';
import { Observable, BehaviorSubject, AsyncSubject, forkJoin } from 'rxjs';
import { CacheEntidadesService } from './cache-entidades.service';
import { Injectable } from '@angular/core';
import { MetadataInfo, tString } from '../../@pika/pika-module';
import { PikaApiService } from '../../@pika/pika-module';
import { HttpClient, HttpResponseBase } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { TraduccionEntidad } from '../../@pika/pika-module';

import { TextoDesdeId } from '../model/texto-desde-id';
import { Consulta, Paginado } from '../../@pika/pika-module';
import { ValorListaOrdenada } from '../../@pika/pika-module';
import { AtributoLista } from '../../@pika/pika-module';
import { debounceTime, first } from 'rxjs/operators';
import { SesionQuery } from '../../@pika/pika-module';
import { DescriptorNodo } from '../model/descriptor-nodo';
import { Acciones } from '../../@pika/pika-module';
import { EventoArbol, EventoContexto } from '../model/eventos-arbol';
import { ConsultaBackend, FiltroConsultaBackend } from '../../@pika/consulta';
import { HighlightHit } from '../../@busqueda-contenido/busqueda-contenido.module';
import { AppLogService } from '../../services/app-log/app-log.service';

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
    private ts: TranslateService, 
    private applog: AppLogService) {
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

      // console.log(moduloId);
      // console.log(permiso);
      return permiso;
    }
  }

  CreaPermiso(appid: string, moduloId: string, mascara: number ): PermisoAplicacion {
    if (this.sesion.ACL.EsAdmin) {
        return this.permisoAdmin;
    } else {
      const permiso = this.permisoSinAcceso;

      permiso.ModuloId = moduloId;
      permiso.AplicacionId = appid;
      if (mascara>0) {
        permiso.NegarAcceso = (mascara & PDENEGARACCESO) > 0;
        permiso.Admin = (mascara & PADMINISTRAR) > 0;
        permiso.Leer = (mascara & PLEER) > 0;
        permiso.Eliminar = (mascara & PELIMINAR) > 0;
        permiso.Escribir = (mascara & PESCRIBIR) > 0;
        permiso.Ejecutar = (mascara & PEJECUTAR) > 0;
        permiso.Mascara = mascara;
      }
      // console.log(moduloId);
      // console.log(permiso);

      const acl =  this.sesion.ACL.Permisos.findIndex(x => x.ModuloId === moduloId
        && x.AplicacionId === appid);

      if(acl>0) {
        this.sesion.ACL.Permisos.slice(acl,1);
      }
      this.sesion.ACL.Permisos.push(permiso);
      
      return permiso;
    }
  }

  /// Gestion de plantillas
  // ---------------------------------------
  // ---------------------------------------

  private DepuraUrl(url: string): string {
    return url.replace(/\/$/, '') + '/';
  }

  public ObtienePlantillas(): Observable<ValorListaOrdenada[]> {
    const url = this.DepuraUrl(this.DepuraUrl(this.app.config.apiUrl) + `metadatos/`) + 'plantillas/' ;
    return this.http.get<ValorListaOrdenada[]>(url);
  }


  public ObtieneMetadataInfo(id: string): Observable<MetadataInfo> {
    const subject = new AsyncSubject<MetadataInfo>();
      const url = this.DepuraUrl(this.DepuraUrl(this.app.config.apiUrl) + `metadatos/` ) + id;
      this.http.get<MetadataInfo>(url).pipe(first())
      .subscribe(m=> {
        subject.next(m);
      }, (e)=>{}, ()=>{subject.complete()})
    return subject;
  }


  public ObtienePaginaMetadatos(plantillaId:string, q: ConsultaBackend ): Observable<Paginado<DocumentoPlantilla>> {
    const url = this.DepuraUrl(this.DepuraUrl(this.app.config.apiUrl) + `metadatos/`) + `${plantillaId}/pagina` ;
    return this.http.post<Paginado<DocumentoPlantilla>>(url, q);
  }


  public ObtenerPaginaPorIds(tipo: string, q: ConsultaBackend) {
    const subject = new AsyncSubject<any>();
    this.cliente.ObtenerPaginaPorIds(tipo, q).pipe(
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
    this.ObtieneMetadatos(tipo, '').pipe(first())
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

    if(m && m.Propiedades) {
      const index = m.Propiedades.findIndex(x => x.Etiqueta === true);
      if (index >= 0) {
        return String(entidad[m.Propiedades[index].Id]);
      }
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


  PostCommand(entidad: string, command: string, body: unknown): Observable<RespuestaComandoWeb> {
    const subject = new AsyncSubject<any>();
    this.cliente.PostCommand(entidad, command, body).pipe(first()).subscribe(
      r=> {
        subject.next(r);
        subject.complete();
      },
    (err) => {
      subject.error(err);
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

  DeleteTodosVinculados(idPadre: string, entidad: string): Observable<any> {
    const subject = new AsyncSubject<any>();
    this.cliente.DeleteTodosVinculados(idPadre, entidad).pipe(
      debounceTime(500),
    ).subscribe(resultado => {
      this.applog.ExitoT('editor-pika.mensajes.ok-vinculados-del-all', null, { nombre: '' });
      subject.next(true);
    }, (error) => {
      this.handleHTTPError(error, entidad, '');
      subject.next(false);
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
  GetFiltroBusqueda(entidad: string, id: string): Observable<FiltroConsultaPropiedad[]> {
    const subject = new AsyncSubject<FiltroConsultaPropiedad[]>();
    const key = this.cache.ClaveFiltroBusqueda(`${entidad}${id}`);

    if (this.cache.has(key)) {
      subject.next(this.cache.get(key));
      subject.complete();
    } else {
      this.cliente.GetFiltroBusqueda(entidad, id).pipe(first())
        .subscribe(m => {
          this.cache.set(key, m);
          subject.next(m);
        },
          () => {
            subject.next([]);
          },
          () => { subject.complete(); });
    }
    return subject;
  }

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
  public ObtieneMetadatos(tipoentidad: string, entidadPadre: string = ''): Observable<MetadataInfo> {
    const subject = new AsyncSubject<MetadataInfo>();
    const key = this.cache.ClaveMetadatos(tipoentidad);
    if (this.cache.has(key)) {
      const m = this.cache.get(key);
      if(m) {
        subject.next(this.MetadatosPorEntidad({...m}, entidadPadre));
      } else {
        subject.next(null);
      }
      // subject.next(m);
      subject.complete();
    } else {
      this.cliente.GetMetadata(tipoentidad).pipe(first())
        .subscribe(m => {
          this.ProcesaMetadatos(tipoentidad, m).pipe(first()).subscribe(procesados => {
            this.cache.set(key, procesados);
            subject.next(this.MetadatosPorEntidad({...procesados}, entidadPadre));
            // subject.next(procesados);
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

  private MetadatosPorEntidad(metadatos: MetadataInfo, entidadPadre: string ): MetadataInfo {
    const especificas = [...metadatos.Propiedades.filter(p=> p.Entidad.toLowerCase() == entidadPadre.toLowerCase() && p.Entidad!=='')];
    const eliminar = [...metadatos.Propiedades.filter(p=> p.Entidad.toLowerCase() != entidadPadre.toLowerCase() && p.Entidad!=='')];
    const todas = [...metadatos.Propiedades];

    /// Elimina la propiedad genérica si hay una por entidad
    especificas.forEach( e=> {
        const index = todas.findIndex(p => p.Id == e.Id && p.Entidad == '');
        if(index >= 0) {
          todas.splice(index, 1);
        }
      });

      // elimina las propiedades de entidad que no son de la actual
      eliminar.forEach( e=> {
        const index = todas.findIndex(p => p.Id == e.Id && p.Entidad.toLowerCase() != entidadPadre.toLowerCase() && p.Entidad !== '');
        if(index >= 0) {
          todas.splice(index, 1);
        }
      });

    metadatos.Propiedades = todas;
    return metadatos;
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

  
  public GetACL(entidad: string, id: string): Observable<number> {
   return this.cliente.GetACL(entidad, id);
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
    consulta: Consulta, Texto: string = null): Observable<Paginado<any>> {

    const subject = new AsyncSubject<Paginado<any>>();

    this.cliente.PageRelated(TipoOrigen, OrigenId, consulta, Entidad, Texto).pipe(
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
   public POSTURLPersonalizada(body: unknown, url: string): Observable<unknown> {
    const subject = new AsyncSubject<unknown>();
    this.cliente.PostPersonalizada(body, url).pipe(
      debounceTime(500), first(),
    ).subscribe(data => {
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


  // realiza una consulta de pagina no relacional
  public ObtenerPaginaPersonalizada(Entidad: string,
    consulta: unknown, url: string): Observable<Paginado<unknown>> {

    const subject = new AsyncSubject<Paginado<any>>();

    this.cliente.PostPagePersonalizada(consulta, url).pipe(
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
  

  public ObtenerPagina(Entidad: string, consulta: Consulta, Texto: string = null): Observable<Paginado<any>> {

    const subject = new AsyncSubject<Paginado<any>>();

    this.cliente.Page(consulta, Entidad, Texto).pipe(
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

  public BuscaTextoDeIdentificadores(tipoentidad: string, pagina: Paginado<any>, metadata?: MetadataInfo):
    Observable<boolean> {
    const subject = new AsyncSubject<boolean>();
    const key = this.cache.ClaveMetadatos(tipoentidad);
    
    if (this.cache.has(key) && metadata == null) {
      metadata = this.cache.get(key);
    }
    
    if (metadata) {
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
        Entidad: ''
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

  private IdsParaCatalogos(pagina: Paginado<any>): string[] {
    const buscar: string[] = [];
    pagina.Elementos.forEach(item => {
      buscar.push(item['Id'])
    });
    return buscar;
  }

  public SinopisPorIds(consultaId: string, pagina: Paginado<any>): Observable<HighlightHit[]>  {
    const ids = this.IdsParaCatalogos(pagina);
    return this.cliente.SinopisPorIds(consultaId, ids);
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

  TemaSeleccionObtener(entidad: string): Observable<ValorListaOrdenada[]> {
    const subject = new AsyncSubject<ValorListaOrdenada[]>();

    const key = this.cache.ClaveSeleccion(entidad);
    const seleccion: ValorListaOrdenada[] = this.cache.get(key);

    if (seleccion != null) {
      subject.next(seleccion);
      subject.complete();
    } else {
      this.cliente.TemaSeleccionObtener(entidad).pipe(
        first()
      ).subscribe(resultado => {
        this.cache.set(key, resultado);
        subject.next(resultado);
      }, (err) => {
        this.handleHTTPError(err, entidad, '');
        subject.next(null);
      }, () => {
        subject.complete();
      });
    }
    return subject;
  }


  SeleccionActualizaCache(seleccion: ValorListaOrdenada[], entidad: string) {
    const key = this.cache.ClaveSeleccion(entidad);
    this.cache.set(key, seleccion);
  }

  TemaSeleccionAdicionar(nombre: string, entidad: string): Observable<ValorListaOrdenada[]> {
    const subject = new AsyncSubject<ValorListaOrdenada[]>();
    this.cliente.TemaSeleccionAdicionar(nombre, entidad).pipe(first())
    .subscribe(resultado => {
      const key = this.cache.ClaveSeleccion(entidad);
      var seleccion: ValorListaOrdenada[] = this.cache.get(key);
      if (seleccion == null) {
        seleccion = [];
      };
      seleccion.push(resultado);
      seleccion = seleccion
      .sort((a, b) => a.Texto < b.Texto ? -1 : a.Texto > b.Texto ? 1 : 0);
      this.cache.set(key, seleccion);
      subject.next(seleccion);
      this.applog.ExitoT('editor-pika.mensajes.ok-tema-add', null, null);
    }, (err) => {
      this.applog.FallaT('editor-pika.mensajes.err-tema-add', null, null);
      subject.next(null);
    }, () => {
      subject.complete();
    });
    return subject;
  }

  SeleccionAdicionar(temaid: string, Ids: string[], tipo: string,): Observable<any> {
    const subject = new AsyncSubject<any>();
    this.cliente.SeleccionAdicionar(temaid, Ids, tipo).pipe(
      first()
    ).subscribe(resultado => {
      this.applog.ExitoT('editor-pika.mensajes.ok-seleccion-add', null, null);
    }, (err) => {
      this.handleHTTPError(err, tipo, '');
      subject.next(null);
    }, () => {
      subject.complete();
    });
    return subject;
  }

  TemaEliminar(temaid: string, tipo: string): Observable<any> {
    const subject = new AsyncSubject<boolean>();
    this.cliente.TemaSeleccionEliminar(temaid, tipo).pipe(
      first()
    ).subscribe(resultado => {
      this.applog.ExitoT('editor-pika.mensajes.ok-seleccion-del', null, null);
      subject.next(true);
    }, (err) => {
      this.handleHTTPError(err, tipo, '');
      subject.next(false);
    }, () => {
      subject.complete();
    });
    return subject;
  }


  SeleccionEliminar(temaid: string, tipo: string, Ids: string[]): Observable<any> {
    const subject = new AsyncSubject<boolean>();
    this.cliente.SeleccionEliminar(temaid, Ids, tipo).pipe(
      first()
    ).subscribe(resultado => {
      this.applog.ExitoT('editor-pika.mensajes.ok-seleccion-del', null, null);
      subject.next(true);
    }, (err) => {
      this.handleHTTPError(err, tipo, '');
      subject.next(false);
    }, () => {
      subject.complete();
    });
    return subject;
  }

  SeleccionVaciar(temaid: string, tipo: string): Observable<any> {
    const subject = new AsyncSubject<boolean>();
    this.cliente.SeleccionVaciar(temaid, tipo).pipe(
      first()
    ).subscribe(resultado => {
      this.applog.ExitoT('editor-pika.mensajes.ok-seleccion-empty', null, null);
      subject.next(true);
    }, (err) => {
      this.handleHTTPError(err, tipo, '');
      subject.next(false);
    }, () => {
      subject.complete();
    });
    return subject;
  }
  

}
