import { Router } from "@angular/router";
import { Component, OnInit } from "@angular/core";
import { AnalyticsService } from "./@core/utils/analytics.service";
import { SeoService } from "./@core/utils/seo.service";
import { TranslateService } from "@ngx-translate/core";
import { LocalStorageService } from "ngx-localstorage";
import { AuthService } from "./services/auth/auth.service";


@Component({
  selector: "ngx-app",
  template: "<router-outlet></router-outlet>",
})
export class AppComponent implements OnInit {

  private enSesion: number;
  private enLogin: number;

  constructor(
    private authService: AuthService,
    public translate: TranslateService,
    private analytics: AnalyticsService,
    private seoService: SeoService,
    private route: Router
  ) {
    translate.addLangs(["es-MX"]);
    translate.setDefaultLang("es-MX");
   
    if(!authService.hasValidToken()) {
      route.navigateByUrl("/bienvenida");
    } 
  }

  ngOnInit(): void {
    this.analytics.trackPageViews();
    this.seoService.trackCanonicalChanges();
  }
}
