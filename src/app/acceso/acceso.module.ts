import { AccesoComponent } from './acceso.component';
import { OAuth2CallbackComponent } from './oauth2-callback/oauth2-callback.component';
import { OAuth2LoginComponent } from './oauth2-login/oauth2-login.component';
import { NgModule } from '@angular/core';
import { NbButtonModule, NbCardModule, NbLayoutModule } from '@nebular/theme';

import { CommonModule } from '@angular/common';
import { ThemeModule } from '../@theme/theme.module';
import { AccesoRoutingModule } from './acceso-routing.module';

@NgModule({
  imports: [
    CommonModule,
    NbLayoutModule,
    ThemeModule,
    NbCardModule,
    NbButtonModule,
    NbLayoutModule,
    CommonModule,
    AccesoRoutingModule,
  ],
  declarations: [
    AccesoComponent,
    OAuth2LoginComponent,
    OAuth2CallbackComponent,
  ],
})
export class AccesoModule { }
