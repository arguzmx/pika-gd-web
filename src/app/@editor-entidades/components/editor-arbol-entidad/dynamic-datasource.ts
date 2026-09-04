import { DynamicDatabase, DynamicFlatNode } from "./dynamic-database";
import { DataSource } from '@angular/cdk/table';
import { BehaviorSubject, Observable, merge, AsyncSubject, Subject } from 'rxjs';
import { FlatTreeControl } from '@angular/cdk/tree';
import { CollectionViewer, SelectionChange } from '@angular/cdk/collections';
import { map, first, takeUntil } from 'rxjs/operators';
import { EventosArbol } from '../../model/eventos-arbol';
import { MatTree } from '@angular/material/tree';


/**
 * File database, it can build a tree structured Json object from string.
 * Each node in Json object represents a file or a directory.
 * For a file, it has filename and type.
 * For a directory, it has filename and children (a list of files or directories).
 * The input will be a json object string, and the output is a list of `FileNode` with nested
 * structure.
 */
 export class DynamicDataSource implements DataSource<DynamicFlatNode> {
    
    public dataChange = new BehaviorSubject<DynamicFlatNode[]>([]);
    private onDestroy$: Subject<void> = new Subject<void>();
    public _tree: MatTree<DynamicFlatNode>;

    get data(): DynamicFlatNode[] {
      return this.dataChange.value;
    }

    set data(value: DynamicFlatNode[]) {
      this._treeControl.dataNodes = value;
      this.dataChange.next(value);
    }
    
    public destroy() {
        this.onDestroy$.next(null);
        this.onDestroy$.complete();
    }

    constructor(
      private _treeControl: FlatTreeControl<DynamicFlatNode>,
      private _database: DynamicDatabase,
    ) {
      this._database.ObtieneEventosArbol()
        .pipe(takeUntil(this.onDestroy$))
        .subscribe(evento => {
          
          if (evento) {
            switch (evento.Evento) {
              case EventosArbol.EliminarNodo:
                const nodo = evento.Origen as DynamicFlatNode;
                const indexeliminar = this.data.findIndex(x => x.id === nodo.id);
                
                let eliminar = 0;
                if (indexeliminar >= 0) {
                  for (let i = indexeliminar + 1; i < this.data.length; i++) {
                    eliminar++;
                    if (this.data[i].level <= nodo.level) {
                      break;
                    }
                  }
                  eliminar = (eliminar == 0) ? 1 : eliminar;
                  this.data.splice(indexeliminar, eliminar);
                  this.dataChange.next(this.data);
                }
                break;
  
              case EventosArbol.ActualizarTextoNodo:
                const index = this._treeControl.dataNodes.findIndex(x => x.id === evento.Valor.id);
                if (index >= 0) this._treeControl.dataNodes[index].texto = evento.Valor.texto;
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
  
    disconnect(collectionViewer: CollectionViewer): void { }

  
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
        .subscribe(children => {
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
            ) { }
            this.data.splice(index + 1, count);
          }
        },
          (err) => {
            console.error(err);
          },
          () => {
            node.isLoading = false;
            this.dataChange.next(this.data);
          });
  
    }
  }
  