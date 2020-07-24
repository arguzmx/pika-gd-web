import { FiltroConsulta } from './../../../@pika/consulta/filtro-consulta';
import { Observable, BehaviorSubject, AsyncSubject, forkJoin } from 'rxjs';
import { CacheEntidadesService } from './cache-entidades.service';
import { Injectable } from '@angular/core';
import { MetadataInfo } from '../../../@pika/metadata';
import { PikaApiService } from '../../../@pika/pika-api';
import { environment } from '../../../../environments/environment.prod';
import { HttpClient, HttpResponseBase } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { TraduccionEntidad } from '../../../@core/comunes/traduccion-entidad';
import { AppLogService } from '../../../@pika/servicios/app-log/app-log.service';
import { TextoDesdeId } from '../model/texto-desde-id';
import { Consulta, Paginado } from '../../../@pika/consulta';
import { ValorListaOrdenada } from '../../../@pika/metadata/valor-lista';
import { Evento } from '../../../@pika/metadata/atributo-evento';
import { AtributoLista } from '../../../@pika/metadata/atributo-valorlista';
import { debounceTime, first } from 'rxjs/operators';

@Injectable()
export class EntidadesService {
  // Almacena las traudcciones de un nombre de instancoi para un identificador
  public ListaIds: TextoDesdeId[] = [];


  public InstanciasObjectos: any [] = [];

  // CLiente APi PIKA
  public cliente: PikaApiService<any, string>;

  private BusEventos = new BehaviorSubject(null);

  constructor(private cache: CacheEntidadesService, private http: HttpClient,
    private ts: TranslateService, private router: Router, private applog: AppLogService) {
      this.Init();
    }

  private Init(): void {
    this.cliente = new PikaApiService(environment.apiUrl, this.http);
  }

  public Destroy(): void {}

  public NewGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0,
        v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

    // Cache de instancias
    // ---------------------------------------
    // ---------------------------------------

    public SetCacheInstanciaEntidad(tipo: string, id: string , entidad: any): void {
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



    // Cache de filtros
    // ---------------------------------------
    // ---------------------------------------
    public SetCacheFiltros(id: string, filtros: FiltroConsulta []) {
      const key = this.cache.ClaveFiltro(id);
      this.cache.set(key, filtros);
    }

    public GetCacheFiltros(id: string): FiltroConsulta [] {
      const key = this.cache.ClaveFiltro(id);
      if (this.cache.has(key)) {
        return this.cache.get(key);
      }
      return [];
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
      const index = m.Propiedades.findIndex( x => x.EsIdRegistro === true);

      if (index >= 0) {
        return String(entidad[m.Propiedades[index].Id]);
      }

      if ( entidad['Id'] ) return entidad['Id'];

      if ( entidad['id'] ) return entidad['id'];

      return '';
    }

  public ObtenerNombreEntidad(tipo: string, entidad: any): string {
    const key = this.cache.ClaveMetadatos(tipo);
    const m: MetadataInfo = this.cache.get(key);
    const index = m.Propiedades.findIndex( x => x.Etiqueta === true);
    if (index >= 0) {
      return String(entidad[m.Propiedades[index].Id]);
    }

    if ( entidad['Nombre'] ) return entidad['Nombre'];

    if ( entidad['Descripcion'] ) return entidad['Descripcion'];

    return '';
  }

  public EliminarEntidad(tipo: string, id: string, nombre: string): Observable<boolean>  {
    const subject = new AsyncSubject<any>();
     this.cliente.Delete([id], tipo).pipe(
       debounceTime(500),
     ).subscribe( resultado =>  {
      this.applog.ExitoT('editor-pika.mensajes.ok-entidad-del', null, { nombre: nombre});
      subject.next(true);
    }, (error) => {
      this.handleHTTPError(error, tipo, '');
      subject.next(false);
     }, () => {
      subject.complete();
     } );

     return subject;
   }

  ActualizarEntidad(tipo: string, Id: string, entidad: any): Observable<any>  {
    const subject = new AsyncSubject<any>();
    const nombre = this.ObtenerNombreEntidad(tipo, entidad);
     this.cliente.Put(Id, entidad, tipo).pipe(
       debounceTime(500),
     ).subscribe( resultado =>  {

      this.applog.ExitoT('editor-pika.mensajes.ok-entidad-act', null, { nombre: nombre});
      subject.next(entidad);

     }, (err) => {
      this.handleHTTPError(err, tipo, nombre);
      subject.next(null);

      }, () => {
       subject.complete();
     } );

     return subject;
   }


  CreaEntidad(tipo: string, entidad: any): Observable<any>  {
    const subject = new AsyncSubject<any>();
    const nombre = this.ObtenerNombreEntidad(tipo, entidad);
     this.cliente.Post(entidad, tipo).pipe(
       debounceTime(500),
     ).subscribe( resultado =>  {

      this.applog.ExitoT('editor-pika.mensajes.ok-entidad-add', null, { nombre: nombre});
      subject.next(resultado);

     }, (error) => {
      this.handleHTTPError(error, tipo, '');
      subject.next(null);
     }, () => {
      subject.complete();
     } );

     return subject;
   }


    // Eventos interproceso
    // ---------------------------------------
    // ---------------------------------------

    ObtieneEventos(): Observable<Evento> {
      return this.BusEventos.asObservable();
    }

    EmiteEvento (evt: Evento): void {
      this.BusEventos.next(evt);
    }


  // Manuejo de listas
  // ---------------------------------------------------------------
  // ---------------------------------------------------------------
  public TypeAhead(lista: AtributoLista, texto: string): Observable<ValorListaOrdenada[]> {
    return this.cliente.PairListTypeAhead(lista, texto);
  }


  SolicitarLista(lista: AtributoLista, consulta: Consulta): Observable<AtributoLista> {
    let query = '';
    consulta.FiltroConsulta.forEach(x =>  query = query + `${x.Propiedad}-${x.Operador}-${x.Valor}` );
    const key = this.cache.ClaveLista(lista.Entidad, query);
    const subject = new AsyncSubject<AtributoLista>();

    if (this.cache.has(key)) {
      lista.Valores = this.cache.get(key);
      subject.next(lista);
      subject.complete();
     } else {
      this.cliente.PairList(lista, consulta).pipe(debounceTime(500), first())
        .subscribe( valores =>  {
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


  // Obtiene los metadatos de un tipo de  entidad
  public ObtieneMetadatos(tipoentidad: string): Observable<MetadataInfo> {
   const subject = new AsyncSubject<MetadataInfo>();
   const key = this.cache.ClaveMetadatos(tipoentidad);

   if (this.cache.has(key)) {
    subject.next(this.cache.get(key));
    subject.complete();
   } else {
    this.cliente.GetMetadata(tipoentidad).pipe(first())
    .subscribe( m => {
      this.ProcesaMetadatos(tipoentidad, m).pipe(first()).subscribe( procesados => {
        this.cache.set(key, procesados);
        subject.next(procesados);
      }, (err) => {
        subject.next(m); }  );
    },
    (error) => {
     this.handleHTTPError(error, 'metadatos', '');
     subject.next(null); },
    () => { subject.complete(); }  );
   }

   return subject;
  }

  // Ontiene las traducciones para los encabezados y los asigna a las propeidaes
  private ProcesaMetadatos(entidad: string, metadatos: MetadataInfo): Observable<MetadataInfo> {
    const subject = new AsyncSubject<MetadataInfo>();
    this.ts.get('entidades.propiedades.' + entidad.toLowerCase()).pipe(first())
    .subscribe( r => {
      metadatos.Propiedades.forEach( p => {
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
    } );
    return subject;
  }

// realiza una consulta de pagina relacional
  public ObtenerPaginaRelacional (TipoOrigen: string, OrigenId: string, Entidad: string,
    consulta: Consulta): Observable<Paginado<any>> {

    const  subject = new AsyncSubject<Paginado<any>>();

    this.cliente.PageRelated(TipoOrigen, OrigenId , consulta, Entidad).pipe(
        debounceTime(500), first(),
    ).subscribe( data => {

        this.BuscaTextoDeIdentificadores(Entidad, data).pipe(first())
        .subscribe( isok => {
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
  public ObtenerPagina (Entidad: string,
    consulta: Consulta): Observable<Paginado<any>> {

    const  subject = new AsyncSubject<Paginado<any>>();

    this.cliente.Page(consulta, Entidad).pipe(
        debounceTime(500), first(),
    ).subscribe( data => {
        this.BuscaTextoDeIdentificadores(Entidad, data).pipe(first())
        .subscribe( isok => {
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


  private BuscaTextoDeIdentificadores(tipoentidad: string, pagina: Paginado<any>):
  Observable<boolean> {
    const subject = new AsyncSubject<boolean>();
    const key  = this.cache.ClaveMetadatos(tipoentidad);
    if (this.cache.has(key)) {
      const metadata: MetadataInfo = this.cache.get(key);
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
        // LLama a la API para obtener todos los identiicadores
        const tasks$ = [];
        buscar.forEach( s => {
            const entidad = s.split('|')[0];
            const lids =  s.split('|')[1].split('&');
            tasks$.push( this.cliente.PairListbyId(lids, entidad).pipe(first()) );
        });

        // resuelve el observable al finalizar todos los threads
        forkJoin(...tasks$).subscribe(results => {
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


  // Proces alos errores de API
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




}
