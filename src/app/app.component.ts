import { first } from 'rxjs/operators';
/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from './@core/utils/analytics.service';
import { SeoService } from './@core/utils/seo.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { AuthService } from './@acceso/auth.service';


@Component({
  selector: 'ngx-app',
  template: '<router-outlet></router-outlet>',
})
export class AppComponent implements OnInit {

  constructor(
    private authService: AuthService,
    public translate: TranslateService,
    private analytics: AnalyticsService,
    private seoService: SeoService,

  ) {
    translate.addLangs(['es-MX']);
    translate.setDefaultLang('es-MX');

    this.authService.runInitialLoginSequence();

  }

  ngOnInit(): void {
    this.analytics.trackPageViews();
    this.seoService.trackCanonicalChanges();
  }

}
