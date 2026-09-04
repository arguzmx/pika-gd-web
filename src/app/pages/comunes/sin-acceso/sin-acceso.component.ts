import { Component, OnInit } from '@angular/core';
import { NbMenuService } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';
import { Traductor } from '../../../@editor-entidades/editor-entidades.module';

@Component({
  selector: 'ngx-sin-acceso',
  templateUrl: './sin-acceso.component.html',
  styleUrls: ['../css/paginas-unicas.css'],
})
export class SinAccesoComponent implements OnInit {

  public T: Traductor;

  constructor(ts: TranslateService,
    private menuService: NbMenuService) {
      this.T  = new Traductor(ts);
  }

  goToHome() {
    this.menuService.navigateHome();
  }

  ngOnInit(): void {
    this.CargaTraducciones();
  }

  private CargaTraducciones() {
    this.T.ts = ['paginascomunes.irhome', 'paginascomunes.titulo401', 'paginascomunes.subtitulo401'];
    this.T.ObtenerTraducciones();
   }

}
