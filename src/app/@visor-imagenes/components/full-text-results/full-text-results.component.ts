import { Highlight, HighlightHit } from './../../../@busqueda-contenido/model/highlight-hit';
import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Columns, Config, DefaultConfig } from 'ngx-easy-table';

@Component({
  selector: 'ngx-full-text-results',
  templateUrl: './full-text-results.component.html',
  styleUrls: ['./full-text-results.component.scss']
})
export class FullTextResultsComponent implements OnInit, OnChanges {
  
  @Input() hit: HighlightHit;
  public highlights: Highlight[] = [];
  public configuration: Config;
  public columns: Columns[];
  
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
      { key: 'ParteId', title: 'Elemento' },
      { key: 'Pagina', title: 'Pagina' },
      { key: 'Texto', title: 'Texto' },
    ];
    this.configuration = { ...DefaultConfig };
  }

}
