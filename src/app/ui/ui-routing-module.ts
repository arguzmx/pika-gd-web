import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { UIRootComponent } from './ui-root-component';
import { UiComponent } from './ui/ui.component';
import { DemoComponent } from './demo/demo.component';


const routes: Routes = [{
  path: '',
  component: UIRootComponent,
  children: [

    {
      path: 'uix',
      component: UiComponent,
    },
    {
      path: 'demo',
      component: DemoComponent,
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UIRoutingModule {
}
