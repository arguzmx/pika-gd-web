import { Component, ViewChild, TemplateRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NbDialogService, NbMediaBreakpointsService, NbSidebarService } from '@nebular/theme';
import { first } from 'rxjs/internal/operators/first';
import { AppConfig } from '../../../app-config';

@Component({
  selector: 'ngx-one-column-layout',
  styleUrls: ['./one-column.layout.scss'],
  templateUrl: './one-column.layout.html',
})
export class OneColumnLayoutComponent {
  toggled: boolean = false;
  logo: string = "../../../assets/images/sidebar_pika.png";

  constructor(private barService: NbSidebarService, private config: AppConfig,) {
    if(this.config.config.headerLogo) 
    {
      this.logo = this.config.config.headerLogo;
    }

    barService.onToggle().subscribe(t=> {
      this.toggled = !this.toggled;
    });

    barService.onExpand().subscribe(t=> {
      this.toggled = false;
    });

    barService.onCollapse().subscribe(t=> {
      this.toggled = true;
    });
  }

}
