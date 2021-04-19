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
  { path: '', redirectTo: '/pages/buscador?OrigenId=bd03c5b8-e1a1-4f5f-bbde-d8bd9ba99b32&OrigenTipo=puntomontaje', pathMatch: 'full' },
  { path: 'index.html', redirectTo: '/pages/buscador?OrigenId=bd03c5b8-e1a1-4f5f-bbde-d8bd9ba99b32&OrigenTipo=puntomontaje', pathMatch: 'full' },
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
