import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { Documento } from '../../model/documento';

@Component({
  selector: 'ngx-host-thumbnails',
  templateUrl: './host-thumbnails.component.html',
  styleUrls: ['./host-thumbnails.component.scss'],
})
export class HostThumbnailsComponent implements OnInit {
  @Input() documento: Documento;
  constructor() {}
  
  ngOnInit(): void {
    this.documento = { Nombre: '', Paginas: [], Id: '', VersionId: '' };
  }
}
