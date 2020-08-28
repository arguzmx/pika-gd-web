import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { VisorImagenesService } from '../../services/visor-imagenes.service';
import { Documento } from '../../model/documento';

@Component({
  selector: 'ngx-host-thumbnails',
  templateUrl: './host-thumbnails.component.html',
  styleUrls: ['./host-thumbnails.component.scss'],
})
export class HostThumbnailsComponent implements OnInit, OnChanges {
  @Input() documento: Documento;
  constructor(private servicioVisor: VisorImagenesService) {}

  ngOnInit(): void {
    this.documento = { Nombre: '', Paginas: [] };
  }

  ngOnChanges(changes: SimpleChanges): void {
    // console.log(changes);
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
}
