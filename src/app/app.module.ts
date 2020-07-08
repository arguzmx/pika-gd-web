import { PikaSesinService } from './@pika/pika-api/pika-sesion-service';
import { PikaModule } from './@pika/pika-module';
import { AppLogService } from './@pika/servicios/app-log/app-log.service';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { CoreModule } from './@core/core.module';
import { ThemeModule } from './@theme/theme.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import {
  NbChatModule,
  NbDatepickerModule,
  NbDialogModule,
  NbMenuModule,
  NbSidebarModule,
  NbToastrModule,
  NbWindowModule,
} from '@nebular/theme';
import { CommonModule } from '@angular/common';
import { IsAuthorizedGuard, IsChldrenAuthorizedGuard } from './@core/services/auth-guard/auth-guard.service';
import { AkitaNgDevtools } from '@datorama/akita-ngdevtools';
import { environment } from '../environments/environment';
import { httpInterceptorProviders } from './@pika/pika-api/interceptor-provider';
import { NbTokenStorage, NbTokenLocalStorage } from '@nebular/auth';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import {NgxLocalStorageModule} from 'ngx-localstorage';
import { PreferenciasService } from './@pika/state/preferencias/preferencias-service';

@NgModule({
  declarations: [AppComponent],
  imports: [
    PikaModule,
    NgxLocalStorageModule.forRoot( { prefix: 'PIKA-'} ),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpTranslateLoader,
        deps: [HttpClient],
      },
    }),
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
    NbChatModule.forRoot({
      messageGoogleMapKey: 'AIzaSyA_wNuCzia92MAmdLRzmqitRGvCF7wCZPY',
    }),
    CoreModule.forRoot(),
    ThemeModule.forRoot(),
    environment.production ? [] : AkitaNgDevtools,
  ],
  bootstrap: [AppComponent],
  providers: [IsAuthorizedGuard, IsChldrenAuthorizedGuard, httpInterceptorProviders, PikaSesinService,
    { provide: NbTokenStorage, useClass: NbTokenLocalStorage }, AppLogService, PreferenciasService],
})
export class AppModule {
  constructor(
  ) { }
}

export function httpTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http);
}