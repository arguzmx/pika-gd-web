import { AccesoComponent } from './acceso.component';
import { OAuth2CallbackComponent } from './oauth2-callback/oauth2-callback.component';
import { OAuth2LoginComponent } from './oauth2-login/oauth2-login.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


const routes: Routes = [
  {
    path: '',
    component: AccesoComponent,
    children: [
      {
        path: 'login',
        component: OAuth2LoginComponent,
      },
      {
        path: 'callback',
        component: OAuth2CallbackComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccesoRoutingModule {
}
