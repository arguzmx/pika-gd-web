import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class BusquedaInterceptor implements HttpInterceptor {
  // intercept any http call done by the httpClient
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // fetch the bearer token from wherever you have stored it
    // NOTE: fetching it directly from window is not a good idea (demo purpose)
    const jwtToken = window.localStorage.getItem('jwtToken');

    // if there is a token, clone the request and set the correct
    // authorization header, if not => just use the old request
    const requestToHandle = jwtToken
      ? request.clone({
        headers: request.headers.set('authorization', `Bearer ${jwtToken}`)
      })
      : request;
    return next.handle(requestToHandle);
  }
}