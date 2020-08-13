import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { VisorImagenesService } from '../../services/visor-imagenes.service';
import { Documento } from '../../model/documento';

@Component({
  selector: 'ngx-visor',
  templateUrl: './visor.component.html',
  styleUrls: ['./visor.component.scss']
})
export class VisorComponent implements OnInit, OnChanges {
  @Input() documento: Documento;
  constructor(private servicioVisor: VisorImagenesService) { }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
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
      console.log(this.documento);
  }

  ngOnInit(): void {
  }

}
