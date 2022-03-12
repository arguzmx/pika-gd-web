import {
  Component,
  OnInit,
  ViewChild,
  TemplateRef,
  OnDestroy,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NbDialogService, NbSelectComponent } from '@nebular/theme';
import { first, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DominioActivo, SesionStore,
  AppBusQuery, PikaSesionService, 
  SesionQuery, UnidadOrganizacionalActiva } from '../../../@pika/pika-module';
import { AppLogService } from '../../../services/app-log/app-log.service';


@Component({
  selector: 'ngx-org-selector',
  templateUrl: './org-selector.component.html',
  styleUrls: ['./org-selector.component.scss'],
})
export class OrgSelectorComponent implements OnInit, OnDestroy {
  // Claves para obtener la traducción
  ts: string[];
  // Objeto resultante de la traduccion
  t: object;

  public dominios: DominioActivo[];
  public unidades: UnidadOrganizacionalActiva[];
  public IdDominio: string;
  public IdUnidadOrg: string;

  @ViewChild('dialogOrg', { static: true }) dialogOrg: TemplateRef<any>;
  @ViewChild('dominio') selDominio;
  @ViewChild('unidad') selUnidad;

  private datosOrg = {Dominio: '', UnidadOrganizacional: '' };
  private dialogOrgRef: any;
  private onDestroy$ = new Subject<void>();
  constructor(
    private translate: TranslateService,
    private dialogService: NbDialogService,
    private sessionStore: SesionStore,
    private pikaSessionService: PikaSesionService,
    private sessionQuery: SesionQuery,
    private applog: AppLogService,
    private appBus: AppBusQuery,
  ) {}

  ngOnInit(): void {
    this.CargaTraducciones();
    this.appBus.AppBus$.pipe(takeUntil(this.onDestroy$)).subscribe((bus) => {
      if (bus.CambiarOrganizacion) {
        this.selectorOrganiacion();
      }
    });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next(null);
    this.onDestroy$.complete();
  }

  private CargaTraducciones() {
    this.ts = ['ui.selec-org', 'ui.aplicar', 'ui.cerrar', 'ui.confirmar'];
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

  selectorOrganiacion(): void {
    const s = this.sessionQuery.getValue().sesion;
    if (s.Dominios.length === 0) {
      this.pikaSessionService
        .GetDominios()
        .pipe(first())
        .subscribe((dominios) => {
          this.sessionStore.setDominios(dominios);
          this.MuestraDialogo();
        });
    } else {
      this.MuestraDialogo();
    }
  }

  private MuestraDialogo() {

    const s = this.sessionQuery.getValue().sesion;
    if (s.Dominios.length > 0) {

      const prefs  = this.sessionQuery.preferencias;
      this.dominios  = s.Dominios;

      // Verifica y asigna un dominio en las preferencias
      const dindex = this.dominios.findIndex( x => x.Id === prefs.Dominio);
      let uindex = -1;
      this.IdDominio = (dindex >= 0) ? prefs.Dominio : '';

      // En el cso de que el dominio a thruty establece la unidad
      this.IdUnidadOrg = '';
      if (this.IdDominio) {
        this.unidades =  this.dominios[dindex].UnidadesOrganizacionales;
        // la unidad asignada debe pernetere a las unidades del dominio
        uindex = this.dominios[dindex].UnidadesOrganizacionales
        .findIndex( x => x.Id === prefs.UnidadOrganizacional);
        if (uindex >= 0)
        this.IdUnidadOrg = prefs.UnidadOrganizacional;
      } else {
        this.IdDominio = this.dominios[0].Id;
        this.unidades =  this.dominios[0].UnidadesOrganizacionales;
        this.IdUnidadOrg = this.unidades ?
        (this.unidades[0] ? this.unidades[0].Id  : '') : '';
      }

      this.datosOrg.Dominio = this.IdDominio;
      this.datosOrg.UnidadOrganizacional = this.IdUnidadOrg;

      this.dialogOrgRef = this.dialogService
        .open(this.dialogOrg, { context: '' });
        // .onClose.subscribe(() => {
        //   this.FinalizarCambioOrg();
        // });
    } else {
      this.applog.FallaT('mensajes.no-org', null, null);
    }
  }

  CambiarOrg() {
    this.sessionStore.setOrganizacion(this.datosOrg.Dominio, this.datosOrg.UnidadOrganizacional);
    this.dialogOrgRef.close();
    this.applog.ExitoT('mensajes.salvar-ok', null, null);
  }



  dominioChange(data: any){
    this.datosOrg.Dominio = data;
    this.datosOrg.UnidadOrganizacional ='';
    const index = this.dominios.findIndex( x => x.Id === data);
    this.unidades =  this.dominios[index].UnidadesOrganizacionales;
    this.IdUnidadOrg = '';
    this.selUnidad.reset();
  }

  unidadoChange(data: any) {
    this.datosOrg.UnidadOrganizacional = data;
  }
}
