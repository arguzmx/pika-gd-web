import { Component, OnInit } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';

@Component({
  selector: 'ngx-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.scss']
})
export class InicioComponent implements OnInit {

  constructor(private oauthService: OAuthService) { }

  ngOnInit(): void {
    let claims = this.oauthService.getIdentityClaims();
    // console.log(claims);
  }

}
