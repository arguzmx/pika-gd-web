import { first } from 'rxjs/operators';
import { Component, OnInit, Output, EventEmitter, OnChanges, 
  SimpleChanges, Input, OnDestroy,  ViewChild, AfterViewInit } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { NodoJerarquico } from '../../../../@pika/consulta/nodo-jerarquico';
import { NodoArbol } from '../../model/nodo-arbol';
import { EditorEntidadesBase } from '../../model/editor-entidades-base';
import { EntidadesService } from '../../services/entidades.service';
import { TranslateService } from '@ngx-translate/core';
import { AppLogService } from '../../../../@pika/servicios/app-log/app-log.service';
import { DescriptorNodo } from '../../model/descriptor-nodo';
import { MetadataInfo } from '../../../../@pika/metadata';
import { ConfiguracionEntidad } from '../../model/configuracion-entidad';
import { DynamicDatabase, DynamicFlatNode, DynamicDataSource } from './dynamic-database';
import { MatTree } from '@angular/material/tree';



@Component({
  selector: 'ngx-editor-arbol-entidad',
  templateUrl: './editor-arbol-entidad.component.html',
  styleUrls: ['./editor-arbol-entidad.component.scss'],
  providers: [DynamicDatabase],
})
export class EditorArbolEntidadComponent extends EditorEntidadesBase
  implements OnInit, OnChanges, OnDestroy, AfterViewInit {
    @ViewChild('arboldinamico') arbol: MatTree<DynamicFlatNode> ;


  constructor(
    private database: DynamicDatabase,
    entidades: EntidadesService,
    ts: TranslateService,
    applog: AppLogService) {
    super(entidades, ts, applog);
    this.treeControl = new FlatTreeControl<DynamicFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new DynamicDataSource(this.treeControl, database );
  }
  ngAfterViewInit(): void {
    this.dataSource._tree = this.arbol;
  }
  ngOnDestroy(): void {
    this.database.destroy();
    this.dataSource.destroy();
  }

  treeControl: FlatTreeControl<DynamicFlatNode>;

  dataSource: DynamicDataSource;

  getLevel = (node: DynamicFlatNode) => node.level;

  isExpandable = (node: DynamicFlatNode) => node.expandable;

  hasChild = (_: number, _nodeData: DynamicFlatNode) => _nodeData.expandable;


  @Input() config: ConfiguracionEntidad;
  @Output() NodoSeleccionado = new EventEmitter();

  selectedNode: NodoArbol = null;
  descriptor: DescriptorNodo = null;
  metadata: MetadataInfo = null;
  validametadata: boolean = false;
  nodos: NodoJerarquico[] = [];
  idJerarquia: string = '';






  public _Reset() {
    this.descriptor = null;
    this.metadata = null;
    this.validametadata = false;
    this.nodos = [];
    this.idJerarquia = '';
  }

  ngOnChanges(changes: SimpleChanges): void {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'config':
            this.ProcesaConfiguracion();
            break;
        }
      }
    }
  }






  public ProcesaConfiguracion(): void {
    this.entidades.ObtieneDescriptorNodo(this.config.TipoEntidad).pipe(first())
      .subscribe(d => {
        this.descriptor = d;
        if (this.descriptor) {
          this.validametadata = true;
          this.entidades.ObtieneMetadatos(this.config.TipoEntidad).pipe(first())
            .subscribe(m => {
              this.metadata = m;
              this.ObtineRaices();
            }, (err) => { this.descriptor = null; });
        }
      }, (err) => { this.descriptor = null; });
  }


  private obtieneIdRaizJerarquia(): string {
    let id = '';
    this.metadata.Propiedades.forEach(p => {
      if (p.Id === this.descriptor.PropIdraiz) {
        const partes = p.IdContextual.split('.');
        id = this.entidades.GetPropiedadCacheContextual(partes[1], partes[0], '');
      }
    });
    return id;
  }


  public ObtineRaices(): void {
    this.idJerarquia = this.obtieneIdRaizJerarquia();
    if (this.idJerarquia) {
      this.database.NodosIniciales(this.idJerarquia, this.config.TipoEntidad,
        this.descriptor).pipe(first())
        .subscribe(ok => {
          this.dataSource.data = this.database.initialData();
        });
    }
  }


  public SeleccionaNodo(nodo: NodoArbol) {
    this.selectedNode = nodo;
    this.NodoSeleccionado.emit(nodo);
  }

  ngOnInit(): void {
  }

}
