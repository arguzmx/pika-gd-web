import { Component, Input, OnInit } from '@angular/core';
import { Pagina } from '../../model/pagina';

@Component({
  selector: 'ngx-visor-otro',
  templateUrl: './visor-otro.component.html',
  styleUrls: ['./visor-otro.component.scss']
})
export class VisorOtroComponent implements OnInit {
@Input() pagina: Pagina;

  constructor() { }

  ngOnInit(): void {
  }

}
