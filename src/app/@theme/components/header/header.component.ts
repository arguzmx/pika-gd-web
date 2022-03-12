import { SesionStore } from './../../../@pika/state/sesion.store';
import { Component, Inject, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NbContextMenuComponent, NbDialogService, NbMediaBreakpointsService, NbMenuItem, NbMenuService, NbSidebarService,
  NbThemeService, 
  NB_WINDOW} from '@nebular/theme';
import { LayoutService } from '../../../@core/utils';
import { filter, first, map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AppBusStore, PostTareaEnDemanda, PropiedadesBus } from '../../../@pika/pika-module';
import { OAuthService } from 'angular-oauth2-oidc';
import { environment } from '../../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { LocalStorageService } from 'ngx-localstorage';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { CentroMensajesComponent } from '../centro-mensajes/centro-mensajes.component';
import { AppLogService } from '../../../services/app-log/app-log.service';
import { CanalTareasService } from '../../../services/canal-tareas/canal-tareas.service';


@Component({
  selector: 'ngx-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();
  userPictureOnly: boolean = false;
  user: any = {};
  ver: string = '';

  tareas: PostTareaEnDemanda[] = [];
  tareasDisponibles: boolean = false;
  tareasConteo: number = 0;

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
  
  // Claves para obtener la traducción
  ts: string[];
  // Objeto resultante de la traduccion
  t: object;

  userMenu: NbMenuItem[] = [ { title: 'Perfil', data: "perfil"  },
   { title: 'Salir', data: "salir" } ];

   @ViewChild('logout') public logoutRef: TemplateRef<any>;

  constructor(
    private appLog: AppLogService,
    private _bottomSheet: MatBottomSheet,
    private canalTareas: CanalTareasService,
    private router: Router,
    private storageService: LocalStorageService,
              private sesion: SesionStore,
              private translate: TranslateService,
              private dialog: NbDialogService,
              private auth: OAuthService,
              private appBusStore: AppBusStore,
              private sidebarService: NbSidebarService,
              private menuService: NbMenuService,
              private themeService: NbThemeService,
              private layoutService: LayoutService,
              private breakpointService: NbMediaBreakpointsService,
              @Inject(NB_WINDOW) private window
              ) {
                this.ver = environment.version;
  }


  private ProcesaNotificacionTareas(tareas: PostTareaEnDemanda[]) {
    const source = JSON.stringify(this.tareas);
    this.tareasConteo = tareas.length;
    this.tareasDisponibles = this.tareasConteo > 0;
    this.tareas = tareas;

    if(JSON.stringify(this.tareas) !== source) {
      this.appLog.ExitoT('componentes.canal-tareas.resultados-existentes');
    }
  }

  ngOnInit() {

    this.canalTareas.TareasServer().subscribe(t=> {
      this.ProcesaNotificacionTareas(t);
    });

    this.currentTheme = this.themeService.currentTheme;

    if(this.auth.hasValidAccessToken()) {
      const claims = this.auth.getIdentityClaims();
      this.user['name'] = claims['preferred_username'] ;
    }

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


      this.menuService.onItemClick()
      .pipe(
        filter(({ tag }) => tag === 'user-menu'),
        map(({ item: { data } }) => data),
      )
      .subscribe(data => this.hubMenuUsuario(data) );

      this.CargaTraducciones();
  }

  MostrarTareea(): void {
    this._bottomSheet.open(CentroMensajesComponent, {
      data: { tareas: this.tareas },
    });
  }

  private CargaTraducciones() {
    this.ts = ['ui.cancelar', 'ui.aceptar', 'ui.advertencia', 'ui.salir-app'];
    this.ObtenerTraducciones();
  }

  // Obtiene las tradcucciones
  ObtenerTraducciones(): void {
    this.translate
      .get(this.ts)
      .pipe(first())
      .subscribe((res) => {
        this.t = res;
      });
  }

  hubMenuUsuario(data: string) {
    switch(data) {
      case "salir":
        this.logout();
        break;

      case "perfil":
        this.router.navigateByUrl('/pages/perfil');
      break;
    }
  }


  logout(): void {
    this.dialog.open(
      this.logoutRef,
      { context: '' });
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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
    // this.menuService.navigateHome();
    // return false;
  }

  selectorOrganiacion(): void {
    this.appBusStore.setPropiedadAppBus(PropiedadesBus.CambiarOrganizacion, true);
  }

  salir():void {
    this.storageService.remove("login");
    this.storageService.set("ensesion", -1);
    this.auth.logOut();
  }

  alternaVisor(): void {
    this.sesion.setVisorActivo();
  }

}
