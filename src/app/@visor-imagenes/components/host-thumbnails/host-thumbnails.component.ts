import { Component, OnInit } from '@angular/core';
import { VisorImagenesService } from '../../services/visor-imagenes.service';

@Component({
  selector: 'ngx-host-thumbnails',
  templateUrl: './host-thumbnails.component.html',
  styleUrls: ['./host-thumbnails.component.scss']
})
export class HostThumbnailsComponent implements OnInit {

  constructor(private servicioVisor: VisorImagenesService) { }

  ngOnInit(): void {
  }

}
