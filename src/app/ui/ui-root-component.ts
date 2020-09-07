import { Component, OnInit } from '@angular/core';
import { SesionQuery } from '../@pika/pika-module';

@Component({
  selector: 'ngx-ui-root',
  styleUrls: ['ui-root-component.scss'],
  template: `
    <ngx-one-column-layout>
      <nb-menu [items]='menu'></nb-menu>
      <router-outlet></router-outlet>
    </ngx-one-column-layout>
  `,
})
export class UIRootComponent implements OnInit {

  menu = [];
  constructor(private sesion: SesionQuery) {
  }
  ngOnInit(): void {
    this.sesion.menus$.subscribe( (menu) => {
      this.menu =  JSON.parse(JSON.stringify(menu));
    });
  }
}
