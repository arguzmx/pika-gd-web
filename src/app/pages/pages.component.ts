import { Component, OnInit } from '@angular/core';
import { SesionQuery } from '../@pika/pika-module';
import { AppEventBus, EventoCerrarPlugins, VISOR } from '../@pika/state/app-event-bus';

@Component({
  selector: 'ngx-pages',
  styleUrls: ['pages.component.scss'],
  templateUrl: 'pages.component.html'
})
export class PagesComponent implements OnInit {

  visorActivo: boolean = false;
  menu = [];

  constructor(
    private appEventBus: AppEventBus,
    private sesion: SesionQuery) {

  }
  ngOnInit(): void {
    this.sesion.menus$.subscribe((menu) => {
      this.menu = JSON.parse(JSON.stringify(menu));
    });


    this.appEventBus.LeeEventos().subscribe(ev => {
      
      switch (ev.tema) {
        case VISOR:
          this.MuestraVisor();
          break;

        case EventoCerrarPlugins.tema:
          this.CerrarPlugins();
          break;

      }
    });

  }

  private CerrarPlugins() {
    this.visorActivo = false;
  }

  private MuestraVisor(): void {
    this.visorActivo = true;
  }

}
