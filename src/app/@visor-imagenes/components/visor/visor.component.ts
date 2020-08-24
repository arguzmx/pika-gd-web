import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { VisorImagenesService } from '../../services/visor-imagenes.service';
import { Documento } from '../../model/documento';
import { fabric } from 'fabric';

@Component({
  selector: 'ngx-visor',
  templateUrl: './visor.component.html',
  styleUrls: ['./visor.component.scss']
})
export class VisorComponent implements OnInit, OnChanges {
  @Input() documento: Documento;
  canvas: any;

  constructor(private servicioVisor: VisorImagenesService) { }

  ngOnChanges(changes: SimpleChanges): void {
    for (const propiedad in changes) {
      if (changes.hasOwnProperty(propiedad)) {
        switch (propiedad) {
          case 'documento':
            this.ProcesaDocumento();
            break;
        }
      }
    }
  }

  private ProcesaDocumento() {
      // console.log(this.documento);
  }

  ngOnInit(): void {
    this.canvas = new fabric.Canvas('canvas');
    this.canvas.add(new fabric.IText('Hello World !'));

    // create a rectangle object
const rect = new fabric.Rect({
  left: 100,
  top: 100,
  fill: 'red',
  width: 150,
  height: 150,
});

// "add" rectangle onto canvas
this.canvas.add(rect);

  }

}
