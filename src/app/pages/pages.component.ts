import { Component, OnInit } from '@angular/core';
import { SesionQuery } from '../@pika/pika-module';

@Component({
  selector: 'ngx-pages',
  styleUrls: ['pages.component.scss'],
  template: `
    <ngx-one-column-layout>
      <ngx-org-selector></ngx-org-selector>
      <nb-menu [items]='menu'></nb-menu>
      <router-outlet></router-outlet>
    </ngx-one-column-layout>
  `,
})
export class PagesComponent implements OnInit {

  menu = [];
  constructor(private sesion: SesionQuery) {

  }
  ngOnInit(): void {
    this.sesion.menus$.subscribe( (menu) => {
      this.menu =  JSON.parse(JSON.stringify(menu));
    });
  }
}
