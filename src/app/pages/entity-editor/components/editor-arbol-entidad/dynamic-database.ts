import { EntidadesService } from './../../services/entidades.service';
import { DataSource } from '@angular/cdk/table';
import { BehaviorSubject, Observable, merge, AsyncSubject, Subject } from 'rxjs';
import { FlatTreeControl } from '@angular/cdk/tree';
import { CollectionViewer, SelectionChange } from '@angular/cdk/collections';
import { map, first, takeUntil } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { DescriptorNodo } from '../../model/descriptor-nodo';
import { EventosArbol, EventoArbol } from '../../../../@pika/metadata/atributo-evento';
import { MatTree } from '@angular/material/tree';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';

export class DynamicFlatNode {

  constructor(
    public id: string,
    public texto: string,
    public level = 0,
    public expandable = true,
    public isLoading = false,
  ) {}
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
    .subscribe( evento => {
        if (evento) {
            const origen: DynamicFlatNode = evento.Origen;
            switch (evento.Evento) {
                    case EventosArbol.ActualizarTextoNodo:
                      if (evento.Valor[this.desc.PropIdPadre] === null ) {
                          // es un nodo raiz
                          const index = this.rootLevelNodes.findIndex(x => x.id === evento.Valor[this.desc.PropId]);
                          if (index >= 0) {
                            evento.Origen = {...this.rootLevelNodes[index]};
                            this.rootLevelNodes[index].texto = evento.Valor[this.desc.PropNombre];
                            evento.Valor = {...this.rootLevelNodes[index]};
                          }
                      } else {
                          // es un nodo hijo
                          const nodopadre = this.dataMap.get(evento.Valor[this.desc.PropIdPadre]);
                          const index = nodopadre.findIndex(x => x.id === evento.Valor[this.desc.PropId]);
                          if (index >= 0) {
                            evento.Origen = {...nodopadre[index]};
                            nodopadre[index].texto = evento.Valor[this.desc.PropNombre];
                            evento.Valor = {...nodopadre[index]};
                          }
                      }
                    break;

                    case EventosArbol.CrearRaiz:
                        const nodoraiz = this.ObtieneRama(evento.Valor, true, 0);
                        this.rootLevelNodes.push(nodoraiz);
                        evento.Valor = nodoraiz;
                        break;
                    case EventosArbol.CrearHijo:
                            const campos = this.dataMap.get(origen.id);
                            const nodohijo = this.ObtieneRama(evento.Valor, true, origen.level + 1);
                            campos.push(nodohijo);
                            this.dataMap.delete(origen.id);
                            this.dataMap.set(origen.id, campos);
                            evento.Valor = nodohijo;
                            break;
                    case EventosArbol.EliminarNodo:
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

      EmiteEventoArbol (evt: EventoArbol): void {
        this.BusArbol.next(evt);
      }


public ObtieneRama(n: any, expandable: boolean, level: number = 0): DynamicFlatNode {
    const f = new DynamicFlatNode(
        n[this.desc.PropId],
        n[this.desc.PropNombre], level, expandable);
    return f;
}

public NodosIniciales(idJerarquia: string, tipo: string, descriptor: DescriptorNodo): Observable<boolean> {
    this.desc = descriptor;
    this.tipo = tipo;
    this.idJerarquia = idJerarquia;

    const subject = new AsyncSubject<any>();
    this.entidades.OntieneRaicesHie(this.idJerarquia, this.tipo).pipe(first())
    .subscribe( nodos => {
      this.rootLevelNodes = [];
      nodos.forEach( n => {
        this.rootLevelNodes.push( this.ObtieneRama(n, true) );
      });
      subject.next(true);
    }, (err) => {
    this.rootLevelNodes = [];
    subject.next(false); },
    () => {
        subject.complete();
    });
    return subject;
}

public getChildren( idnodo: string): Observable<DynamicFlatNode[]> {
    const subject = new AsyncSubject<any>();

    if ( this.dataMap.has(idnodo)) {
        subject.next( this.dataMap.get(idnodo));
        subject.complete();
    } else {
        this.entidades.OntieneHijosHie(this.idJerarquia, idnodo, this.tipo).pipe(first())
        .subscribe( nodos => {
          const hijos = [];
          nodos.forEach( n => {
            const f = new DynamicFlatNode(
            n[this.desc.PropId],
            n[this.desc.PropNombre], 1);
            hijos.push( f );
          });
          this.dataMap.set(idnodo, hijos);
          subject.next(hijos);
        }, (err) => {
        subject.next([]); },
        () => {
            subject.complete();
        });
    }
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

/**
 * File database, it can build a tree structured Json object from string.
 * Each node in Json object represents a file or a directory.
 * For a file, it has filename and type.
 * For a directory, it has filename and children (a list of files or directories).
 * The input will be a json object string, and the output is a list of `FileNode` with nested
 * structure.
 */
export class DynamicDataSource implements DataSource<DynamicFlatNode> {
  dataChange = new BehaviorSubject<DynamicFlatNode[]>([]);
  private onDestroy$: Subject<void> = new Subject<void>();

  get data(): DynamicFlatNode[] {
    return this.dataChange.value;
  }
  set data(value: DynamicFlatNode[]) {
    this._treeControl.dataNodes = value;
    this.dataChange.next(value);
  }
  public _tree: MatTree<DynamicFlatNode>;

  constructor(
    private _treeControl: FlatTreeControl<DynamicFlatNode>,
    private _database: DynamicDatabase,
  ) {
    this._database.ObtieneEventosArbol()
    .pipe(takeUntil(this.onDestroy$))
    .subscribe( evento => {
        if ( evento) {
        switch ( evento.Evento) {
          case EventosArbol.EliminarNodo:
          const nodo = evento.Origen as DynamicFlatNode;
          const indexeliminar = this.data.findIndex(x => x.id === nodo.id);
          let eliminar = 0;
          if (indexeliminar >= 0 ){
            for (let i = indexeliminar + 1; i < this.data.length; i++){
              eliminar++;
              if ( this.data[i].level <= nodo.level) {
                break;
              }
            }
          }
          this.data.splice(indexeliminar, eliminar);
          this.dataChange.next(this.data);
            break;

          case EventosArbol.ActualizarTextoNodo:
            const index = this._treeControl.dataNodes.findIndex(x => x.id === evento.Valor.id);
            if (index >= 0)  this._treeControl.dataNodes[index].texto = evento.Valor.texto;
            break;

            case EventosArbol.CrearRaiz:
                this.addnode(evento.Origen, evento.Valor, true);
                break;

            case EventosArbol.CrearHijo:
                this.addnode(evento.Origen, evento.Valor, false);
                break;
        }
    }
    });
  }

  connect(collectionViewer: CollectionViewer): Observable<DynamicFlatNode[]> {
    this._treeControl.expansionModel.changed.subscribe((change) => {
      if (
        (change as SelectionChange<DynamicFlatNode>).added ||
        (change as SelectionChange<DynamicFlatNode>).removed
      ) {
        this.handleTreeControl(change as SelectionChange<DynamicFlatNode>);
      }
    });

    return merge(collectionViewer.viewChange, this.dataChange).pipe(
      map(() => this.data),
    );
  }

  disconnect(collectionViewer: CollectionViewer): void {}

  public destroy() {
    this.onDestroy$.next(null);
    this.onDestroy$.complete();
 }

  /** Handle expand/collapse behaviors */
  handleTreeControl(change: SelectionChange<DynamicFlatNode>) {
    if (change.added) {
      change.added.forEach((node) => this.toggleNode(node, true));
    }
    if (change.removed) {
      change.removed
        .slice()
        .reverse()
        .forEach((node) => this.toggleNode(node, false));
    }
  }


  addnode(node: DynamicFlatNode, newNode: DynamicFlatNode, isroot: boolean) {
    if (isroot) {
         this.data.splice(0, 0, ...[newNode]);
    } else {
        node.isLoading = true;
        const index = this.data.indexOf(node);
        this.data.splice(index + 1, 0, ...[newNode]);
        node.isLoading = false;
    }
    this.dataChange.next(this.data);
  }

  /**
   * Toggle the node, remove from display list
   */
  toggleNode(node: DynamicFlatNode, expand: boolean) {
    node.isLoading = true;
    this._database.getChildren(node.id).pipe(first())
    .subscribe( children => {
        const index = this.data.indexOf(node);
        if (!children || index < 0) {
            // If no children, or cannot find the node, no op
            node.isLoading = false;
            return;
        }
        if (expand) {
            const nodes = children.map(
                (n) =>
                  new DynamicFlatNode(
                    n.id,
                    n.texto,
                    node.level + 1,
                    true,
                    false,
                  ),
              );
              this.data.splice(index + 1, 0, ...nodes);
        } else {
            let count = 0;
            for (
              let i = index + 1;
              i < this.data.length && this.data[i].level > node.level;
              i++, count++
            ) {}
            this.data.splice(index + 1, count);
        }
    },
    (err) => {
        // tslint:disable-next-line: no-console
        console.log(err);
    },
    () => {
        node.isLoading = false;
        this.dataChange.next(this.data);
    });

  }
}
