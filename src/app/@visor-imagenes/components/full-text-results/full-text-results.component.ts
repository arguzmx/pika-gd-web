import { Highlight, HighlightHit, HighlightProcesado } from './../../../@busqueda-contenido/model/highlight-hit';
import { Component, Input, OnInit, OnChanges, SimpleChanges, TemplateRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { Config, DefaultConfig, Columns, APIDefinition, API } from 'ngx-easy-table';
import { Documento } from '../../model/documento';
import { TranslateService } from '@ngx-translate/core';
import { AppLogService } from '../../../@pika/pika-module';
import { Traductor } from '../../../@editor-entidades/editor-entidades.module';

@Component({
  selector: 'ngx-full-text-results',
  templateUrl: './full-text-results.component.html',
  styleUrls: ['./full-text-results.component.scss']
})
export class FullTextResultsComponent implements OnInit, OnChanges {

  @ViewChild('table', { static: true }) table: APIDefinition;
  @ViewChild('strHTMLTpl', { static: true }) strHTMLTpl: TemplateRef<any>;
  @Output() NuevaSeleccion = new EventEmitter();
  @Input() hit: HighlightHit;
  @Input() documento: Documento;
  
  public T: Traductor;
  public highlights: HighlightProcesado[] = [];
  public highlightsTmp: Highlight[] = [];
  public configuration: Config;
  public columns: Columns[];

  public entidadseleccionada: any = null;
  public renglonSeleccionado: number = -1;
  
  constructor(ts: TranslateService,
    applog: AppLogService,) {
      this.T = new Traductor(ts);
      this.CargaTraducciones();
  }

  private CargaTraducciones() {
    this.T.ts = ['busqueda.col-highlight', 'busqueda.col-posicion', 'busqueda.col-documento'];
    this.T.ObtenerTraducciones();
  }

  ngOnChanges(changes: SimpleChanges): void {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        switch (propName) {
          case 'hit':
            this.procesaConfiguracion();
            break;
        }
      }
    }
  }

  private procesaConfiguracion() {
    this.configureTable();
    this.highlightsTmp = this.hit.Highlights;
    const tmp: HighlightProcesado[] = [];
    if(this.documento) {
      this.highlightsTmp.forEach(h=> {
          const item = this.documento.Paginas.find(p => p.Id == h.ParteId);
          if(item) {
            if (item.EsPDF) {
              tmp.push( { ParteNombre:item.Nombre, ParteId: h.ParteId, Pagina: `${String(item.Indice)} / ${String(h.Pagina)}`, Texto: h.Texto })
            } else {
              tmp.push( { ParteNombre:item.Nombre, ParteId: h.ParteId, Pagina: String(item.Indice), Texto: h.Texto })
            }
          } 
      });
    }
    this.highlights = tmp;
  }

  ngOnInit(): void {
    
  }

  private configureTable() {
    this.columns = [
      // { key: 'ParteNombre', title: this.T.t['busqueda.col-documento'],  width: '5%'  },
      { key: 'Texto', title: this.T.t['busqueda.col-highlight'], width: '90%', cellTemplate: this.strHTMLTpl },
      { key: 'Pagina', title: this.T.t['busqueda.col-posicion'], width: '10%' },
    ];
    this.configuration = { ...DefaultConfig };
  }

  public LimpiarSeleccion(): void {
    const color_par = '#FFFFFF';
    const color_non = '#f6f7f9';
    let color: string;
    if (this.highlights) {
      for (let index = 0; index < this.highlights.length; index++) {
        if (((index + 1) % 2) === 0) {
          color = color_par;
        } else {
          color = color_non;
        }
        const val = { row: index + 1, attr: 'background-color', value: color };
        this.table.apiEvent({
          type: API.setRowStyle,
          value: val,
        });
      }
    }
  }

  public SetSeleccion(i: number): void {
    const val = { row: i + 1, attr: 'background-color', value: '#9ECDFF' };
    this.table.apiEvent({
      type: API.setRowStyle,
      value: val,
    });
  }

  // listener para eventos de la tabla
  eventosTabla($event: { event: string; value: any }): void {
    this.LimpiarSeleccion();
    switch ($event.event) {
      case 'onOrder':
      case 'onPagination':
        break;

      case 'onClick':
        this.renglonSeleccionado = $event.value.rowId;
          this.entidadseleccionada = $event.value.row;
          this.SetSeleccion(this.renglonSeleccionado);  
          this.NuevaSeleccion.emit(this.entidadseleccionada);
        break;

      case 'onDoubleClick':
        break;

      case 'onSelectAll':
        break;
    }
  }

}
