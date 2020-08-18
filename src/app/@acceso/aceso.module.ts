import { HttpClientModule } from '@angular/common/http';
import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { AuthConfig, OAuthModule, OAuthModuleConfig, OAuthStorage } from 'angular-oauth2-oidc';
import { authConfig } from './auth-config';
import { AuthService } from './auth.service';
import { authModuleConfig } from './auth-module-config';

export function storageFactory(): OAuthStorage {
  return localStorage;
}

@NgModule({
  imports: [
    HttpClientModule,
    OAuthModule.forRoot(),
  ],
  providers: [
    AuthService,
  ],
})
export class AcesoModule {
  static forRoot(): ModuleWithProviders<AcesoModule> {
    return {
      ngModule: AcesoModule,
      providers: [
        { provide: AuthConfig, useValue: authConfig },
        { provide: OAuthModuleConfig, useValue: authModuleConfig },
        { provide: OAuthStorage, useFactory: storageFactory },
      ]
    };
  }

  constructor (@Optional() @SkipSelf() parentModule: AcesoModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in the AppModule only');
    }
  }
}
