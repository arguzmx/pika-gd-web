import { AppLogService } from './@pika/servicios/app-log/app-log.service';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
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
import { PikaModule } from './@pika/pika-module';


@NgModule({
  declarations: [AppComponent],
  imports: [
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
  providers: [IsAuthorizedGuard, IsChldrenAuthorizedGuard, httpInterceptorProviders,
    { provide: NbTokenStorage, useClass: NbTokenLocalStorage }, AppLogService],
})
export class AppModule {
  constructor(
  ) { }
}
