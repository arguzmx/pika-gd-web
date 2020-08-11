// tslint:disable-next-line: max-line-length
import { EditorBootJerarquicoComponent } from './entity-editor/components/editor-boot-jerarquico/editor-boot-jerarquico.component';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { PagesComponent } from './pages.component';
// tslint:disable-next-line: max-line-length
import { EditorBootTabularComponent } from './entity-editor/components/editor-boot-tabular/editor-boot-tabular.component';
import { HostUploaderComponent } from './host-uploader/host-uploader.component';
const routes: Routes = [{
  path: '',
  component: PagesComponent,
  children: [

    {
      path: 'tabular',
      component: EditorBootTabularComponent,
    },
    {
      path: 'upload',
      component: HostUploaderComponent,
    },
    {
      path: 'jerarquia',
      component: EditorBootJerarquicoComponent,
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
