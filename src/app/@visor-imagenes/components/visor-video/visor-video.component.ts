import { Component, Input, OnInit } from '@angular/core';
import { Pagina } from '../../model/pagina';

@Component({
  selector: 'ngx-visor-video',
  templateUrl: './visor-video.component.html',
  styleUrls: ['./visor-video.component.scss']
})
export class VisorVideoComponent implements OnInit {
  @Input() pagina: Pagina;

  constructor() { }

  ngOnInit(): void {
  }
}
