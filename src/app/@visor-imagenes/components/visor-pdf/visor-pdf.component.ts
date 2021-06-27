import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Pagina } from '../../model/pagina';

@Component({
  selector: 'ngx-visor-pdf',
  templateUrl: './visor-pdf.component.html',
  styleUrls: ['./visor-pdf.component.scss']
})
export class VisorPdfComponent implements OnInit, OnChanges {
  @Input() pagina: Pagina;
  public url: string = '';

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    this.muestraPDF();
  }

  ngOnInit(): void {
    //this.muestraPDF();
  }

  muestraPDF() {
    this.url = this.pagina.Url ? this.pagina.Url : '';
  }
}
