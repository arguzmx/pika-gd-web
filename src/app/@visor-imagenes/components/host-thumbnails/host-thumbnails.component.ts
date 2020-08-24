import { Pagina } from './../../model/pagina';
import { Component, OnInit } from '@angular/core';
import { VisorImagenesService } from '../../services/visor-imagenes.service';

@Component({
  selector: 'ngx-host-thumbnails',
  templateUrl: './host-thumbnails.component.html',
  styleUrls: ['./host-thumbnails.component.scss']
})
export class HostThumbnailsComponent implements OnInit {

  seleccioandas: Pagina[] = [];

  constructor(private servicioVisor: VisorImagenesService) { }

  ngOnInit(): void {
  }

  // ejemplo de como llamar a los camios para las páginas seleccioandas
  public NuevaSeleccion() {
    this.servicioVisor.EstablecePaginasSeleccionadas(this.seleccioandas);
  }

}
