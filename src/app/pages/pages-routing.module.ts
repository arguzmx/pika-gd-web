import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { PagesComponent } from './pages.component';
// tslint:disable-next-line: max-line-length
import { EditorBootTabularComponent } from './entity-editor/components/editor-boot-tabular/editor-boot-tabular.component';
const routes: Routes = [{
  path: '',
  component: PagesComponent,
  children: [

    {
      path: 'tabular',
      component: EditorBootTabularComponent,
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
