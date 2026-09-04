import { Component, Input, OnInit } from '@angular/core';
import { Pagina } from '../../model/pagina';

@Component({
  selector: 'ngx-visor-audio',
  templateUrl: './visor-audio.component.html',
  styleUrls: ['./visor-audio.component.scss']
})
export class VisorAudioComponent implements OnInit {
@Input() pagina: Pagina;

  constructor() { }

  ngOnInit(): void {
  }

}
