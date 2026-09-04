import { EntidadesService } from './../../services/entidades.service';
import { BehaviorSubject, Observable, merge, AsyncSubject, Subject } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { DescriptorNodo } from '../../model/descriptor-nodo';
import { EventosArbol, EventoArbol } from '../../model/eventos-arbol';


export class DynamicFlatNode {

  constructor(
    public id: string,
    public texto: string,
    public level = 0,
    public expandable = true,
    public isLoading = false,
  ) { }
}

/**
 * Database for dynamic data. When expanding a node in the tree,
 * the data source will need to fetch
 * the descendants data from the database.
 */
@Injectable()
export class DynamicDatabase {
  private desc: DescriptorNodo;
  private tipo: string;
  private idJerarquia: string;
  private onDestroy$: Subject<void> = new Subject<void>();
  private BusArbol = new BehaviorSubject(null);

  dataMap = new Map<string, DynamicFlatNode[]>([]);

  rootLevelNodes: DynamicFlatNode[] = [];

  constructor(private entidades: EntidadesService) {
    this.entidades.ObtieneEventosArbol()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(evento => {
        if (evento) {
          const origen: DynamicFlatNode = evento.Origen;
          switch (evento.Evento) {
            case EventosArbol.ActualizarTextoNodo:
              if (evento.Valor[this.desc.PropIdPadre] === null) {
                // es un nodo raiz
                const index = this.rootLevelNodes.findIndex(x => x.id === evento.Valor[this.desc.PropId]);
                if (index >= 0) {
                  evento.Origen = { ...this.rootLevelNodes[index] };
                  this.rootLevelNodes[index].texto = evento.Valor[this.desc.PropNombre];
                  evento.Valor = { ...this.rootLevelNodes[index] };
                }
              } else {
                // es un nodo hijo
                const nodopadre = this.dataMap.get(evento.Valor[this.desc.PropIdPadre]);
                const index = nodopadre.findIndex(x => x.id === evento.Valor[this.desc.PropId]);
                if (index >= 0) {
                  evento.Origen = { ...nodopadre[index] };
                  nodopadre[index].texto = evento.Valor[this.desc.PropNombre];
                  evento.Valor = { ...nodopadre[index] };
                }
              }
              break;

            case EventosArbol.CrearRaiz:
              const nodoraiz = this.ObtieneRama(evento.Valor, true, 0);
              this.rootLevelNodes.push(nodoraiz);
              this.dataMap.set(this.ObtieneId(evento.Valor) , []);
              evento.Valor = nodoraiz;
              break;

            case EventosArbol.CrearHijo:

              const hijos = this.dataMap.get(origen.id);
              const nodohijo = this.ObtieneRama(evento.Valor, true, origen.level + 1);
              hijos.push(nodohijo);
              this.dataMap.delete(origen.id);
              this.dataMap.set(origen.id, hijos);
              this.dataMap.set(this.ObtieneId(evento.Valor), []);
              evento.Valor = nodohijo;
              break;

            case EventosArbol.EliminarNodo:
              this.dataMap.delete(this.ObtieneId(evento.Origen));
              break;
          }
        }

        this.EmiteEventoArbol(evento);
      });
  }

  public destroy() {
    this.onDestroy$.next(null);
    this.onDestroy$.complete();
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


  public ObtieneRama(n: any, expandable: boolean, level: number = 0): DynamicFlatNode {
    const f = new DynamicFlatNode(
      n[this.desc.PropId],
      n[this.desc.PropNombre], level, expandable);
    return f;
  }

  public ObtieneId(n: any): string {
    return n[this.desc.PropId];
  }

  public NodosIniciales(idJerarquia: string, tipo: string, descriptor: DescriptorNodo): Observable<boolean> {
    this.desc = descriptor;
    this.tipo = tipo;
    this.idJerarquia = idJerarquia;

    const subject = new AsyncSubject<any>();
    this.entidades.OntieneRaicesHie(this.idJerarquia, this.tipo).pipe(first())
      .subscribe(nodos => {
        this.rootLevelNodes = [];
        nodos.forEach(n => {
          this.rootLevelNodes.push(this.ObtieneRama(n, true));
          this.dataMap.set(this.ObtieneId(n), []);
        });
        subject.next(true);
      }, (err) => {
        this.rootLevelNodes = [];
        subject.next(false);
      },
        () => {
          subject.complete();
        });
    return subject;
  }

  public getChildren(idnodo: string): Observable<DynamicFlatNode[]> {
    const subject = new AsyncSubject<any>();

    this.entidades.OntieneHijosHie(this.idJerarquia, idnodo, this.tipo).pipe(first())
        .subscribe(nodos => {
          const hijos = [];
          nodos.forEach(n => {
            const f = new DynamicFlatNode(
              n[this.desc.PropId],
              n[this.desc.PropNombre], 1);
              // Añade los nodos a los datos y al flatmap
              hijos.push(f);
              this.dataMap.set(f.id, []);
          });
          this.dataMap.set(idnodo, hijos);
          subject.next(hijos);
        }, (err) => {
          subject.next([]);
        },
          () => {
            subject.complete();
          });

    return subject;
  }


  /** Initial data from database */
  initialData(): DynamicFlatNode[] {
    return this.rootLevelNodes.map(
      (item) => new DynamicFlatNode(item.id, item.texto, 0, true),
    );
  }


  isExpandable(id: string): boolean {
    return this.dataMap.has(id);
  }
}

