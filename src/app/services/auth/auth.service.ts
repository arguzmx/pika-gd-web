/* eslint-disable brace-style */

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { OAuthErrorEvent, OAuthService } from 'angular-oauth2-oidc';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { AppConfig } from '../../app-config';
import { AppLogService } from '../app-log/app-log.service';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private isAuthenticatedSubject$ = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject$.asObservable();

  private isDoneLoadingSubject$ = new BehaviorSubject<boolean>(false);
  public isDoneLoading$ = this.isDoneLoadingSubject$.asObservable();

  private profileSubject$ = new BehaviorSubject<object>(null);
  public profile$ = this.profileSubject$.asObservable();

  private path: string = '/pages/inicio'
  private ExpirationDate: Date;


  timeLeft: number = 60;
  interval;

  startTimer() {
    this.interval = setInterval(() => {
      const mins = this.getMinutesBetweenDates(this.ExpirationDate);
      if(mins < 5){
        this.pauseTimer()
        this.oauthService.refreshToken().then(()=> {
          this.programRefresh(this.oauthService.getAccessTokenExpiration());
        }).catch((err)=> { console.error(err); this.router.navigateByUrl('/Bienvenida')});
      } 
    },30000)
  }

  pauseTimer() {
    clearInterval(this.interval);
  }
    

 getMinutesBetweenDates(endDate : Date) {
    var startDate = new Date();
    var diff = endDate.getTime() - startDate.getTime();
    return (diff / 60000);
 }

  programRefresh(date:number) {
    this.ExpirationDate = new Date(date);
    this.startTimer();
  }

  /**
   * Publishes `true` if and only if (a) all the asynchronous initial
   * login calls have completed or errorred, and (b) the user ended up
   * being authenticated.
   *
   * In essence, it combines:
   *
   * - the latest known state of whether the user is authorized
   * - whether the ajax calls for initial log in have all been done
   */
  public canActivateProtectedRoutes$: Observable<boolean> = combineLatest([
    this.isAuthenticated$,
    this.isDoneLoading$
  ]).pipe(map(values => values.every(b => b)));

  private navigateToLoginPage() {
    // TODO: Remember current URL
    // this.router.navigateByUrl('/bienvenida');
  }

  private navigateToInicio() {
    if(this.path.indexOf('bienvenida')>0 || (this.path == '/')) {
      this.path='';
    }
    // TODO: Remember current URL
    if(this.path) {
      this.router.navigateByUrl(this.path);
    } else {
      this.router.navigateByUrl('/pages/inicio');
    }
    
  }

  constructor(
    private applog: AppLogService,
    private appConfig: AppConfig,
    private oauthService: OAuthService,
    private router: Router,
    private http: HttpClient,
  ) {
    // Useful for debugging:
    this.oauthService.events.subscribe(event => {
      if (event instanceof OAuthErrorEvent) {
       // console.error('OAuthErrorEvent Object:', event);
      } else {
        // console.warn('OAuthEvent Object:', event);
        // console.warn(this.oauthService.hasValidAccessToken());
        if (this.oauthService.hasValidAccessToken()) {
          this.isAuthenticatedSubject$.next(this.oauthService.hasValidAccessToken());
          // this.navigateToInicio();
        }
      }
    });

    // This is tricky, as it might cause race conditions (where access_token is set in another
    // tab before everything is said and done there.
    // TODO: Improve this setup. See: https://github.com/jeroenheijmans/sample-angular-oauth2-oidc-with-auth-guards/issues/2
    window.addEventListener('storage', (event) => {

      // The `key` is `null` if the event was caused by `.clear()`
      if (event.key !== 'access_token' && event.key !== null) {
        return;
      }

      console.warn('Noticed changes to access_token (most likely from another tab), updating isAuthenticated');
      this.isAuthenticatedSubject$.next(this.oauthService.hasValidAccessToken());

      // if (!this.oauthService.hasValidAccessToken()) {
      //   this.navigateToLoginPage();
      // } else {
      //   this.navigateToInicio();
      // }
    });

    this.oauthService.events
      .subscribe(_ => {
        // console.debug(this.oauthService.hasValidAccessToken());
        this.isAuthenticatedSubject$.next(this.oauthService.hasValidAccessToken());
      });

    this.oauthService.events
      .pipe(filter(e => ['token_received'].includes(e.type)))
      .subscribe(e => this.oauthService.loadUserProfile());

    this.oauthService.events
      .pipe(filter(e => ['session_terminated', 'session_error'].includes(e.type)))
      .subscribe(e => this.navigateToLoginPage());

    this.oauthService.setupAutomaticSilentRefresh();
  }

  public runInitialLoginSequence(): Promise<void> {
    // if (location.hash) {
    //   console.debug('Encountered hash fragment, plotting as table...');
    //   console.debug(location.hash.substr(1).split('&').map(kvp => kvp.split('=')));
    // }


    this.path = `${window.location.pathname}${window.location.search}`;

    return this.appConfig.load().then(()=>{
      this.oauthService.issuer = this.appConfig.config.authUrl;
      // console.log("Config loeaded");
    })
    .then(()=>{
    // 0. LOAD CONFIG:
    // First we have to check to see how the IdServer is
    // currently configured:
    this.oauthService.loadDiscoveryDocument()
      // 1. HASH LOGIN:
      // Try to log in via hash fragment after redirect back
      // from IdServer from initImplicitFlow:
      .then(() => { 
        this.oauthService.tryLogin();
        // console.log("Trye login"); 
      })
      .then(() => {
        // console.log("Is Valid token");
        // console.log(this.oauthService.hasValidAccessToken());

        if (this.oauthService.hasValidAccessToken()) {
          this.programRefresh(this.oauthService.getAccessTokenExpiration());
          this.oauthService.loadUserProfile().finally(()=> {
            this.profileSubject$.next(this.oauthService.getIdentityClaims());
            this.isAuthenticatedSubject$.next(this.oauthService.hasValidAccessToken());
            this.navigateToInicio();
            return Promise.resolve();
          })
        }

        
        
        return Promise.resolve();
        // 2. SILENT LOGIN:
        // Try to log in via a refresh because then we can prevent
        // needing to redirect the user:
        return this.oauthService.silentRefresh()
          .then(() => Promise.resolve())
          .then(() => new Promise<void>(resolve => setTimeout(() => resolve(), 1500)))
          .catch(result => {
            // Subset of situations from https://openid.net/specs/openid-connect-core-1_0.html#AuthError
            // Only the ones where it's reasonably sure that sending the
            // user to the IdServer will help.
            const errorResponsesRequiringUserInteraction = [
              'interaction_required',
              'login_required',
              'account_selection_required',
              'consent_required',
            ];

            // console.log("No silent refresh");

            // console.log(result);

            if (result
              && result.reason
              && errorResponsesRequiringUserInteraction.indexOf(result.reason.error) >= 0) {

              // 3. ASK FOR LOGIN:
              // At this point we know for sure that we have to ask the
              // user to log in, so we redirect them to the IdServer to
              // enter credentials.
              //
              // Enable this to ALWAYS force a user to login.
              // this.login();
              //
              // Instead, we'll now do this:
              console.warn('User interaction is needed to log in, we will wait for the user to manually log in.');
              return Promise.resolve();
            }

            // We can't handle the truth, just pass on the problem to the
            // next handler.
            return Promise.reject(result);
          });
      })
      .then(() => {
        // console.log("last resort");
        // this.isDoneLoadingSubject$.next(true);

        // // Check for the strings 'undefined' and 'null' just to be sure. Our current
        // // login(...) should never have this, but in case someone ever calls
        // // initImplicitFlow(undefined | null) this could happen.
        // if (this.oauthService.state && this.oauthService.state !== 'undefined' && this.oauthService.state !== 'null') {
        //   let stateUrl = this.oauthService.state;
        //   if (stateUrl.startsWith('/') === false) {
        //     stateUrl = decodeURIComponent(stateUrl);
        //   }
        //   // console.log(`There was state of ${this.oauthService.state}, so we are sending you to: ${stateUrl}`);
        //   if(stateUrl.toLocaleLowerCase().indexOf('bienvenida')>=0){
        //     stateUrl='/pages/inicio';
        //   }
        // this.router.navigateByUrl(stateUrl);
        //}
      })
      .catch(() => this.isDoneLoadingSubject$.next(true));

    })
    .catch(() => this.isDoneLoadingSubject$.next(true));

    
  }

  public login(user: string, password: string, targetUrl?: string): Promise<void> {
    // Note: before version 9.1.0 of the library you needed to
    // call encodeURIComponent on the argument to the method.

    // console.log("oic");
    return this.appConfig.load().then(()=>{
        this.oauthService.issuer = this.appConfig.config.authUrl;
        this.oauthService.oidc = false;
        // console.log("Config loeaded");
    })
    .then(()=>{
        // 0. LOAD CONFIG:
        // First we have to check to see how the IdServer is
        // currently configured:
        this.oauthService.loadDiscoveryDocument().then(() => {
          this.oauthService
            .fetchTokenUsingPasswordFlowAndLoadUserProfile(user, password)
            .then((resp) => {
                this.programRefresh(this.oauthService.getAccessTokenExpiration());
                this.profileSubject$.next( this.oauthService.getIdentityClaims());
                this.navigateToInicio();
                return Promise.resolve();
              }).catch((err)=> {
              console.error(err);
              this.applog.FallaT('ui.login-err');
              return Promise.reject();
            });
        });
    })
    .catch((err) => { return Promise.reject(); this.applog.FallaT('ui.login-err');})
    // this.oauthService.initLoginFlow(targetUrl || this.router.url);
  }

  public logout() { this.pauseTimer();
    this.pauseTimer();
    const logoutURL = `${this.oauthService.issuer.replace(/\/+$/, '')}/connect/endsession?id_token_hint=${this.oauthService.getAccessToken()}`;
    this.http.get(logoutURL).toPromise().finally(()=> { 
      window.localStorage.removeItem('access_token');
      window.localStorage.removeItem('refresh_token');
      window.localStorage.removeItem('id_token');
    });
    this.router.navigateByUrl('/bienvenida');
  }  
  
  public refresh() { this.oauthService.silentRefresh(); }
  public hasValidToken() { return this.oauthService.hasValidAccessToken(); }

  // These normally won't be exposed from a service like this, but
  // for debugging it makes sense.
  public get accessToken() { return this.oauthService.getAccessToken(); }
  public get refreshToken() { return this.oauthService.getRefreshToken(); }
  public get identityClaims() { return this.oauthService.getIdentityClaims(); }
  public get idToken() { return this.oauthService.getIdToken(); }
  public get logoutUrl() { return this.oauthService.logoutUrl; }
}