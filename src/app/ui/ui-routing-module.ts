import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { UIRootComponent } from './ui-root-component';
import { UiComponent } from './ui/ui.component';


const routes: Routes = [{
  path: '',
  component: UIRootComponent,
  children: [

    {
      path: 'uix',
      component: UiComponent,
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UIRoutingModule {
}
