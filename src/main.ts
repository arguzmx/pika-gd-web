/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { enableAkitaProdMode } from '@datorama/akita';

if (environment.production) {
  enableProdMode();
  enableAkitaProdMode();
}


platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
