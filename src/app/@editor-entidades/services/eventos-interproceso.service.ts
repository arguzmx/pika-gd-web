import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AsyncSubject, BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, first } from 'rxjs/operators';
import { Consulta } from '../../@pika/consulta';
import { AtributoLista, Evento, ValorListaOrdenada } from '../../@pika/metadata';
import { PikaApiService } from '../../@pika/pika-api';
import { SesionQuery } from '../../@pika/state';
import { CacheEntidadesService } from './cache-entidades.service';

@Injectable()
export class EventosInterprocesoService {

  private BusEventos = new BehaviorSubject(null);
  public cliente: PikaApiService<any, string>;

  constructor(private cache: CacheEntidadesService, private http: HttpClient,
    private sesion: SesionQuery,) {
      this.Init();
     }

    private Init(): void {
      this.cliente = new PikaApiService(this.sesion, this.http);
    }

  // Eventos interproceso
  // ---------------------------------------
  // ---------------------------------------

  ObtieneEventos(): Observable<Evento> {
    return this.BusEventos.asObservable();
  }

  EmiteEvento(evt: Evento): void {
    this.BusEventos.next(evt);
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

}
