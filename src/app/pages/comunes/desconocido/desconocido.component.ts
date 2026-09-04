import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NbMenuService } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';
import { Traductor } from '../../../@editor-entidades/editor-entidades.module';

@Component({
  selector: 'ngx-desconocido',
  templateUrl: './desconocido.component.html',
  styleUrls: ['../css/paginas-unicas.css'],
})
export class DesconocidoComponent implements OnInit {

  public T: Traductor;

  constructor(ts: TranslateService,
    private router:  Router,
    private menuService: NbMenuService) {
      
      console.info(router.url);
      console.info(router.getCurrentNavigation());
      this.T  = new Traductor(ts);
  }

  goToHome() {
    this.menuService.navigateHome();
  }

  ngOnInit(): void {
    this.CargaTraducciones();
  }

  private CargaTraducciones() {
    this.T.ts = ['paginascomunes.irhome', 'paginascomunes.titulo404', 'paginascomunes.subtitulo404'];
    this.T.ObtenerTraducciones();
   }

}
