import { Component, OnInit } from '@angular/core';
import { SesionQuery } from '../../@pika/state/sesion.query';

@Component({
  selector: 'ngx-pages',
  styleUrls: ['entity-editor.component.scss'],
  template: `
    <ngx-one-column-layout>
      <router-outlet></router-outlet>
    </ngx-one-column-layout>
  `,
})
export class EntityEditorComponent {
}
