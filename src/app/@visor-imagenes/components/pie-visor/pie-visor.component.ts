import { Component, OnInit } from '@angular/core';
import { VisorImagenesService } from '../../services/visor-imagenes.service';

@Component({
  selector: 'ngx-pie-visor',
  templateUrl: './pie-visor.component.html',
  styleUrls: ['./pie-visor.component.scss']
})
export class PieVisorComponent implements OnInit {

  constructor(private servicioVisor: VisorImagenesService) { }

  ngOnInit(): void {
  }

}
