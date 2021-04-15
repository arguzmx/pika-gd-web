import {
  PikaModule, AppLogService, PikaSesionService,
  httpInterceptorProviders, EntidadesResolver
} from './@pika/pika-module';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { CoreModule } from './@core/core.module';
import { ThemeModule } from './@theme/theme.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import {
  NbDatepickerModule,
  NbDialogModule,
  NbMenuModule,
  NbSidebarModule,
  NbToastrModule,
  NbWindowModule,
} from '@nebular/theme';
import { CommonModule } from '@angular/common';
import { IsChldrenAuthorizedGuard } from './@core/services/auth-guard/auth-guard.service';
import { AkitaNgDevtools } from '@datorama/akita-ngdevtools';
import { environment } from '../environments/environment';
import { NbTokenStorage, NbTokenLocalStorage } from '@nebular/auth';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NgxLocalStorageModule } from 'ngx-localstorage';
import { CookieService } from 'ngx-cookie-service';
import { OAuthModule } from 'angular-oauth2-oidc';
import { DiccionarioNavegacion } from './@editor-entidades/editor-entidades.module';
import { PIKADiccionarioNavegacion } from './@core/data/diccionario-vistas';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { NgxMaskModule } from 'ngx-mask';
import { APP_INITIALIZER } from '@angular/core';
import { AppConfig, TokenProvider } from './app-config';

export function servicesOnRun(config: AppConfig, token: TokenProvider) {
  return () => config.load().then(() => token.load());
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    PikaModule,
    NgxLocalStorageModule.forRoot({ prefix: 'PIKA-' }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpTranslateLoader,
        deps: [HttpClient],
      },
    }),
    FormsModule,
    ReactiveFormsModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    NgxMaskModule.forRoot(),
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    NbSidebarModule.forRoot(),
    NbMenuModule.forRoot(),
    NbDatepickerModule.forRoot(),
    NbDialogModule.forRoot(),
    NbWindowModule.forRoot(),
    NbToastrModule.forRoot(),
    CoreModule.forRoot(),
    ThemeModule.forRoot(),
    environment.production ? [] : AkitaNgDevtools,
    OAuthModule.forRoot(),
  ],
  bootstrap: [AppComponent],
  providers: [
    IsChldrenAuthorizedGuard,
    httpInterceptorProviders,
    PikaSesionService, CookieService,
    { provide: DiccionarioNavegacion, useClass: PIKADiccionarioNavegacion },
    { provide: NbTokenStorage, useClass: NbTokenLocalStorage },
    AppLogService,
    AppConfig,
    TokenProvider,
    {
      provide: APP_INITIALIZER,
      useFactory: servicesOnRun,
      multi: true,
      deps: [AppConfig, TokenProvider]
    }
  ],
})
export class AppModule {
  constructor(
  ) { }
}

export function httpTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http);
}