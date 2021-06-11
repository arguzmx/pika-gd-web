import {
  Component,
  OnInit,
  Input,
} from '@angular/core';
import { VisorImagenesService } from '../../services/visor-imagenes.service';
import { Documento } from '../../model/documento';

@Component({
  selector: 'ngx-host-thumbnails',
  templateUrl: './host-thumbnails.component.html',
  styleUrls: ['./host-thumbnails.component.scss'],
})
export class HostThumbnailsComponent implements OnInit {
  @Input() documento: Documento;
  constructor(private servicioVisor: VisorImagenesService) {}

  ngOnInit(): void {
    this.documento = { Nombre: '', Paginas: [], Id: '', VersionId: '' };
  }
}
