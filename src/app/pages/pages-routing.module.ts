import { LinkContenidoGenericoComponent } from './../@editor-entidades/components/link-contenido-generico/link-contenido-generico.component';
import { SinAccesoComponent } from './comunes/sin-acceso/sin-acceso.component';
import { InicioComponent } from './comunes/inicio/inicio.component';
import { DesconocidoComponent } from './comunes/desconocido/desconocido.component';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { PagesComponent } from './pages.component';
// tslint:disable-next-line: max-line-length
import { EditorBootTabularComponent, EditorBootJerarquicoComponent } from '../@editor-entidades/editor-entidades.module';
import { EventosConfigHostComponent, PermisosHostComponent, PermisosModuloComponent } from '../@gestor-permisos/gestor-permisos.module';
import { HostVisorContenidoComponent } from './host-visor-contenido/host-visor-contenido.component';
import { HostBusquedaContenidoComponent } from './host-busqueda-contenido/host-busqueda-contenido.component';
import { EntidadesResolver } from '../@pika/pika-module';
import { ConfiguracionAplicacionComponent, PerfilUsuarioComponent } from '../@configuracion/configuracion.module';

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
      path: 'bitacora-config',
      component: EventosConfigHostComponent,
    },
    {
      path: 'visor',
      component: HostVisorContenidoComponent,
    },
    {
      path: 'buscador',
      component: HostBusquedaContenidoComponent,
      resolve: {
        entidadesResolver: EntidadesResolver,
      }
    },
    {
      path: 'perfil',
      component: PerfilUsuarioComponent,
    },
        {
      path: 'cofiguracionsistema',
      component: ConfiguracionAplicacionComponent,
    },
    {
      path: 'linkcontenidogenerico',
      component: LinkContenidoGenericoComponent,
      resolve: {
        entidadesResolver: EntidadesResolver,
      }
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
      resolve: {
        entidadesResolver: EntidadesResolver,
      },
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
