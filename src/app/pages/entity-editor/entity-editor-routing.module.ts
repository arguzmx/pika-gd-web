import { EntityEditorComponent } from './entity-editor.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditorJerarquicoComponent } from './components/editor-jerarquico/editor-jerarquico.component';
import { EditorTabularComponent } from './components/editor-tabular/editor-tabular.component';


const routes: Routes = [
  {
    path: '',
    component: EntityEditorComponent,
    children: [
      {
        path: 'tabular',
        component: EditorTabularComponent,
      },
      {
        path: 'jerarquia',
        component: EditorJerarquicoComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EntityEditorRoutingModule {
}
