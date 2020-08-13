import { Component, OnInit } from '@angular/core';
import { VisorImagenesService } from '../../services/visor-imagenes.service';

@Component({
  selector: 'ngx-thumbnail',
  templateUrl: './thumbnail.component.html',
  styleUrls: ['./thumbnail.component.scss']
})
export class ThumbnailComponent implements OnInit {

  constructor(private servicioVisor: VisorImagenesService) { }

  ngOnInit(): void {
  }

}
