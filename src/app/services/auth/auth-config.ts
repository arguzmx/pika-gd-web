import { AuthConfig } from 'angular-oauth2-oidc';

export const authConfig: AuthConfig = {
  skipIssuerCheck: true,
  issuer: 'http://localhost:4000',
  requireHttps: false,
  clientId: 'api-pika-gd-angular', 
  responseType: 'code',
  redirectUri: window.location.origin + '/', // silentRefreshRedirectUri: window.location.origin + '/silent-refresh.html',
  scope: 'openid profile offline_access pika-gd', 
};
