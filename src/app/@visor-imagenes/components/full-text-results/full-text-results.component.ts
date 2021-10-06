import { Highlight, HighlightHit } from './../../../@busqueda-contenido/model/highlight-hit';
import { Component, Input, OnInit, OnChanges, SimpleChanges, TemplateRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { Config, DefaultConfig, Columns, APIDefinition, API } from 'ngx-easy-table';

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
  public highlights: Highlight[] = [];
  public configuration: Config;
  public columns: Columns[];

  public entidadseleccionada: any = null;
  public renglonSeleccionado: number = -1;
  
  constructor() { }

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
    this.highlights = this.hit.Highlights;
  }

  ngOnInit(): void {
    this.columns = [
      { key: 'ParteId', title: 'Elemento',  width: '5%'  },
      { key: 'Pagina', title: 'Pagina', width: '5%' },
      { key: 'Texto', title: 'Texto', width: '90%', cellTemplate: this.strHTMLTpl },
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
