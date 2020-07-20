
import { NgModule } from '@angular/core';
import { NbMenuModule } from '@nebular/theme';

import { ThemeModule } from '../@theme/theme.module';
import { PagesComponent } from './pages.component';
import { PagesRoutingModule } from './pages-routing.module';
import { EntityEditorModule } from './entity-editor/entity-editor.module';

@NgModule({
  imports: [
    PagesRoutingModule,
    ThemeModule,
    NbMenuModule,
    EntityEditorModule,
  ],
  declarations: [
    PagesComponent,
  ],
})
export class PagesModule {
}
