import { IsChldrenAuthorizedGuard } from './@core/services/auth-guard/auth-guard.service';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

export const routes: Routes = [
  {
    path: 'ui',
    loadChildren: () => import('./ui/ui.module')
      .then(m => m.UiModule),
  },
  {
    canActivateChild: [ IsChldrenAuthorizedGuard ],
    path: 'pages',
    loadChildren: () => import('./pages/pages.module')
      .then(m => m.PagesModule),
  },
  { path: '', redirectTo: '/pages/jerarquia?tipo=cuadroclasificacion&t=ElementoClasificacion&c=EntradaClasificacion&id=bbf0b8e6-4bc1-4b42-ade3-4c9afef2b9ed&disp=2', pathMatch: 'full' },
  { path: 'index.html', redirectTo: '/pages/jerarquia?tipo=cuadroclasificacion&t=ElementoClasificacion&c=EntradaClasificacion&id=bbf0b8e6-4bc1-4b42-ade3-4c9afef2b9ed&disp=2', pathMatch: 'full' },
  { path: '**', redirectTo: 'pages/404' },
];

const config: ExtraOptions = {
  useHash: false,
};

@NgModule({
  imports: [RouterModule.forRoot(routes, config)],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
