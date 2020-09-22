import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { PagesComponent } from './pages.component';
// tslint:disable-next-line: max-line-length
import { HostUploaderComponent } from './host-uploader/host-uploader.component';
import { EditorBootTabularComponent, EditorBootJerarquicoComponent } from '../@editor-entidades/editor-entidades.module';
import { PermisosHostComponent, PermisosModuloComponent } from '../@gestor-permisos/gestor-permisos.module';
import { HostVisorContenidoComponent } from './host-visor-contenido/host-visor-contenido.component';
const routes: Routes = [{
  path: '',
  component: PagesComponent,
  children: [
    {
      path: 'tabular',
      component: EditorBootTabularComponent,
    },
    {
      path: 'jerarquia',
      component: EditorBootJerarquicoComponent,
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
      path: 'upload',
      component: HostUploaderComponent,
    },
    {
      path: '',
      redirectTo: 'dashboard',
      pathMatch: 'full',
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
