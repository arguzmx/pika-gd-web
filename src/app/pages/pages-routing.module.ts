import { SinAccesoComponent } from './comunes/sin-acceso/sin-acceso.component';
import { InicioComponent } from './comunes/inicio/inicio.component';
import { DesconocidoComponent } from './comunes/desconocido/desconocido.component';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { PagesComponent } from './pages.component';
// tslint:disable-next-line: max-line-length
import { EditorBootTabularComponent, EditorBootJerarquicoComponent } from '../@editor-entidades/editor-entidades.module';
import { PermisosHostComponent, PermisosModuloComponent } from '../@gestor-permisos/gestor-permisos.module';
import { HostVisorContenidoComponent } from './host-visor-contenido/host-visor-contenido.component';
import { EntidadesResolver } from '../@pika/pika-module';
const routes: Routes = [{
  path: '',
  component: PagesComponent,
  children: [
    {
      path: 'tabular',
      component: EditorBootTabularComponent,
      resolve: {
        entidadesResolver: EntidadesResolver,
      },
    },
    {
      path: 'jerarquia',
      component: EditorBootJerarquicoComponent,
      resolve: {
        entidadesResolver: EntidadesResolver,
      },
    },
    {
      path: 'permisos',
      component: PermisosHostComponent,
    },
    {
      path: 'visor',
      component: HostVisorContenidoComponent,
    },
    {
      path: '404',
      component: DesconocidoComponent,
    },
    {
      path: 'sinacceso',
      component: SinAccesoComponent,
    },
    {
      path: 'inicio',
      component: InicioComponent,
    },
    // {
    //   path: 'entidades',
    //   loadChildren: () => import('./entity-editor/entity-editor-routing.module')
    //     .then(m => m.EntityEditorRoutingModule),
    // },
    // {
    //   path: '**',
    //   component: NotFoundComponent,
    // },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {
}
