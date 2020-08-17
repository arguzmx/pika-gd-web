import { AppBusStore, PropiedadesBus } from './../../../@pika/state/app-bus/app-bus-store';
import { PikaSesinService } from './../../../@pika/pika-api/pika-sesion-service';
import { SesionStore, PropiedadesSesion } from './../../../@pika/state/sesion.store';
import { PreferenciasService } from './../../../@pika/state/preferencias/preferencias-service';
import { DominioActivo } from './../../../@pika/sesion/dominio-activo';
import { SesionQuery } from './../../../@pika/state/sesion.query';
import { Component, OnDestroy, OnInit, ViewChild, TemplateRef, Output, EventEmitter } from '@angular/core';
import { NbMediaBreakpointsService, NbMenuService, NbSidebarService, 
  NbThemeService } from '@nebular/theme';
import { UserData } from '../../../@core/data/users';
import { LayoutService } from '../../../@core/utils';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { NbAuthService, NbAuthJWTToken, NbAuthOAuth2Token } from '@nebular/auth';


@Component({
  selector: 'ngx-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();
  userPictureOnly: boolean = false;
  user: any;
  dominios: DominioActivo[] = [];
  currentDominio: any = null;

  themes = [
    {
      value: 'default',
      name: 'Light',
    },
    {
      value: 'dark',
      name: 'Dark',
    },
    {
      value: 'cosmic',
      name: 'Cosmic',
    },
    {
      value: 'corporate',
      name: 'Corporate',
    },
  ];

  currentTheme = 'default';

  userMenu = [ { title: 'Profile' }, { title: 'Log out' } ];

  constructor(
              private appBusStore: AppBusStore,
              private sesion: SesionQuery,
              private sidebarService: NbSidebarService,
              private menuService: NbMenuService,
              private themeService: NbThemeService,
              private userService: UserData,
              private layoutService: LayoutService,
              private sesionStore: SesionStore,
              private servicioPreferencias: PreferenciasService,
              private breakpointService: NbMediaBreakpointsService,
              ) {
  }



  ngOnInit() {
    // this.currentDominio = this.servicioPreferencias.getDominio();
    // if (this.currentDominio){
    //   this.changeDominio(this.currentDominio);
    // }
    // this.inicializaDominio();

    this.currentTheme = this.themeService.currentTheme;

    this.userService.getUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe((users: any) => this.user = users.nick);

    const { xl } = this.breakpointService.getBreakpointsMap();
    this.themeService.onMediaQueryChange()
      .pipe(
        map(([, currentBreakpoint]) => currentBreakpoint.width < xl),
        takeUntil(this.destroy$),
      )
      .subscribe((isLessThanXl: boolean) => this.userPictureOnly = isLessThanXl);

    this.themeService.onThemeChange()
      .pipe(
        map(({ name }) => name),
        takeUntil(this.destroy$),
      )
      .subscribe(themeName => this.currentTheme = themeName);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  inicializaDominio(): void {
    this.sesion.dominios$.pipe(takeUntil(this.destroy$))
    .subscribe((dominios: DominioActivo[]) => {
      this.dominios = dominios;
      if ((this.currentDominio === '') &&
        this.dominios && dominios.length > 0) {
        // this.changeDominio(this.dominios[0].Id);
      }
    });
  }

  changeTheme(themeName: string) {
    this.themeService.changeTheme(themeName);
  }


  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');
    this.layoutService.changeLayoutSize();

    return false;
  }

  navigateHome() {
    this.menuService.navigateHome();
    return false;
  }

  selectorOrganiacion(): void {
    this.appBusStore.setPropiedadAppBus(PropiedadesBus.CambiarOrganizacion, true);
  }


}
