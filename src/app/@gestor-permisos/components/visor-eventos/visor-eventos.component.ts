import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { NbSelectComponent } from "@nebular/theme";
import { TranslateService } from "@ngx-translate/core";
import { Columns, Config, DefaultConfig } from "ngx-easy-table";
import { forkJoin, timer } from "rxjs";
import { first } from "rxjs/operators";
import { Traductor } from "../../../@editor-entidades/editor-entidades.module";
import { Aplicacion, ModuloAplicacion } from "../../../@pika/seguridad";
import { addMinutes, format } from "date-fns";
import { TipoEventoAuditoria } from "../../../@pika/seguridad/tipo-evento-auditoria";
import { AppLogService } from "../../../services/app-log/app-log.service";
import { QueryBitacora } from "../../modelos/query-bitacora";
import { BitacoraService } from "../../services/bitacora.service";
import { Paginado } from "../../../@pika/consulta";
import { EventoAuditoria } from "../../modelos/evento-auditoria";
import { ValorListaOrdenada } from "../../../@pika/metadata";

@Component({
  selector: "ngx-visor-eventos",
  templateUrl: "./visor-eventos.component.html",
  styleUrls: ["./visor-eventos.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisorEventosComponent implements OnInit {
  @ViewChild("selectev") selectEventos: NbSelectComponent;
  @ViewChild("selectapp") selectApp: NbSelectComponent;
  @ViewChild("selectmod") selectMod: NbSelectComponent;
  @ViewChild("selectusers") selectUsers: NbSelectComponent;

  @ViewChild("dti") datei: any;
  @ViewChild("dtf") datef: any;
  @ViewChild("tdti") tdatei: any;
  @ViewChild("tdtf") tdatef: any;

  @ViewChild("fechaTpl", { static: true }) fechaTpl: TemplateRef<any>;

  private timeZoneOffset = new Date().getTimezoneOffset();
  data: any[];
  columns: Columns[] = [];
  configuration: Config;
  apps: Aplicacion[] = [];
  mods: ModuloAplicacion[] = [];
  personas: any[] = [];
  eventos: TipoEventoAuditoria[] = [];
  usaurios: ValorListaOrdenada[] = [];

  public T: Traductor;

  constructor(
    ts: TranslateService,
    private readonly cdr: ChangeDetectorRef,
    private applog: AppLogService,
    private bitacoraService: BitacoraService
  ) {
    this.T = new Traductor(ts);
  }

  public pagination = {
    limit: 10,
    offset: 1,
    count: -1,
    sort: "Id",
    order: "DESC",
  };

  private timerRefresco;
  private iteracionesTimer: number;

  private IniciaTimerRefresco() {
    this.iteracionesTimer = 10;
    this.timerRefresco = timer(100, 500).subscribe((t) => {
      this.cdr.detectChanges();
      this.iteracionesTimer -= 1;
      if (this.iteracionesTimer == 0) {
        this.DetieneTimerRefresco();
      }
    });
  }

  private DetieneTimerRefresco() {
    this.timerRefresco.unsubscribe();
  }

  ///  Inicializa las opciones para la tabla
  ConfiguraTabla(): void {
    this.configuration = { ...DefaultConfig };
    this.configuration.isLoading = false;
    this.configuration.fixedColumnWidth = false;
    this.configuration.serverPagination = true;
    this.configuration.threeWaySort = false;
    this.configuration.tableLayout.style = "normal";
    this.configuration.tableLayout.striped = true;
    this.configuration.tableLayout.borderless = false;
    this.configuration.paginationEnabled = true;
    this.configuration.selectRow = false;
    this.configuration.checkboxes = false;
    this.configuration.horizontalScroll = false;

    // this.columns.push({
    //   key: 'Id',
    //   title: 'Id',
    //   orderEnabled: true,
    //   searchEnabled: true,
    // });

    this.columns.push({
      key: "Fecha",
      title: this.T.t["auditoria.entidad.Fecha"],
      orderEnabled: true,
      cellTemplate: this.fechaTpl,
    });

    this.columns.push({
      key: "UsuarioId",
      title: this.T.t["auditoria.entidad.UsuarioId"],
      orderEnabled: true,
    });

    this.columns.push({
      key: "DireccionRed",
      title: this.T.t["auditoria.entidad.DireccionRed"],
      orderEnabled: true,
    });

    this.columns.push({
      key: "AppId",
      title: this.T.t["auditoria.entidad.AppId"],
      orderEnabled: true,
    });

    this.columns.push({
      key: "ModuloId",
      title: this.T.t["auditoria.entidad.ModuloId"],
      orderEnabled: true,
    });

    this.columns.push({
      key: "TipoEventoTexto",
      title: this.T.t["auditoria.entidad.TipoEvento"],
    });

    this.columns.push({
      key: "IdEntidad",
      title: this.T.t["auditoria.entidad.IdEntidad"],
    });

    this.columns.push({
      key: "NombreEntidad",
      title: this.T.t["auditoria.entidad.NombreEntidad"],
    });

    this.columns.push({
      key: "Delta",
      title: this.T.t["auditoria.entidad.Delta"],
    });
  }

  private onPagination(): void {
    // this.pagination.limit = obj.value.limit ? obj.value.limit : this.pagination.limit;
    // this.pagination.offset = obj.value.page ? obj.value.page : this.pagination.offset;
    // this.pagination.sort = !!obj.value.key ? obj.value.key : this.pagination.sort;
    // this.pagination.order = !!obj.value.order ? obj.value.order : this.pagination.order;
    // this.pagination = { ...this.pagination };
    // if (this.busuedaPersonalizada) {
    //     this.obtenerPaginaPeronalizada(false, false);
    // } else {
    //   this.obtenerPaginaDatos(false, false);
    // }
  }
  // listener para eventos de la tabla
  eventosTabla($event: { event: string; value: any }): void {
    switch ($event.event) {
      case "onOrder":
        this.pagination.order = $event.value.order;
        this.pagination.sort = $event.value.key;
        this.Buscar();
        break;

      case "onPagination":
        this.pagination.offset = $event.value.page;
        this.pagination.limit = $event.value.limit;
        this.Buscar();
        break;

      case "onClick":
        break;

      case "onDoubleClick":
        break;

      case "onCheckboxSelect":
        break;

      case "onSelectAll":
        break;
    }
  }

  ngOnInit(): void {
    this.CargaTraducciones();
    const tmpapp: Aplicacion[] = [];
    const app = this.bitacoraService.ObtenerApp().pipe(first());
    const usuarios = this.bitacoraService.UsuariosDominio().pipe(first());
    forkJoin([app, usuarios]).subscribe((resultados) => {
      this.personas = resultados[1];
      const traducciones: string[] = [];

      resultados[0].forEach((a) => {
        if (a.Modulos.findIndex((m) => m.EventosAuditables.length > 0) >= 0) {
          a.Modulos = a.Modulos.sort((a, b) => {
            if (a.Nombre < b.Nombre) {
              return -1;
            }
            if (a.Nombre > b.Nombre) {
              return 1;
            }
            return 0;
          });
          tmpapp.push(a);
        }
      });

      tmpapp.forEach((a) => {
        if (a.Modulos) {
          a.Modulos.forEach((m) => {
            if (m.EventosAuditables) {
              m.EventosAuditables.forEach((v) => {
                v.Id = `${v.AppId}$${v.ModuloId}$${v.TipoEntidad}$${v.TipoEvento}`;
                v.Activo = false;
                v.Descripcion = `auditoria.eventos.${v.Descripcion}`;
                traducciones.push(v.Descripcion);
              });
            }
          });
        }
      });

      this.T.ObtenerTraduccion(traducciones)
        .pipe(first())
        .subscribe((p) => {
          tmpapp.forEach((a) => {
            if (a.Modulos) {
              a.Modulos.forEach((m) => {
                if (m.EventosAuditables) {
                  m.EventosAuditables.forEach((v) => {
                    v.Descripcion = p[v.Descripcion];
                  });
                }
              });
            }
          });
          this.apps = tmpapp;
        });
    });
  }

  private CargaTraducciones() {
    this.T.ts = [
      "componentes.auditoria.lbl-aplicacion",
      "componentes.auditoria.ph-aplicacion",
      "componentes.auditoria.lbl-modulo",
      "componentes.auditoria.ph-modulo",
      "componentes.auditoria.lbl-evento",
      "componentes.auditoria.ph-evento",
      "componentes.auditoria.lbl-usuarios",
      "componentes.auditoria.ph-usuarios",
      "componentes.auditoria.lbl-fechai",
      "componentes.auditoria.lbl-fechaf",
      "componentes.auditoria.titulo",
      "componentes.auditoria.buscar",
      "componentes.auditoria.limpiar",
      "ui.sin-resultados-tabla",
      "auditoria.entidad.Id",
      "auditoria.entidad.Fecha",
      "auditoria.entidad.DireccionRed",
      "auditoria.entidad.IdSesion",
      "auditoria.entidad.UsuarioId",
      "auditoria.entidad.DominioId",
      "auditoria.entidad.UAId",
      "auditoria.entidad.Exitoso",
      "auditoria.entidad.Fuente",
      "auditoria.entidad.AppId",
      "auditoria.entidad.ModuloId",
      "auditoria.entidad.TipoEvento",
      "auditoria.entidad.TipoFalla",
      "auditoria.entidad.TipoEntidad",
      "auditoria.entidad.IdEntidad",
      "auditoria.entidad.NombreEntidad",
      "auditoria.entidad.Delta",
      "auditoria.entidad.TipoEventoTexto",
    ];
    this.T.ObtenerTraducciones();
    this.ConfiguraTabla();
  }

  Limpiar() {
    this.tdatei.nativeElement.value = "";
    this.tdatei._selected = null;
    this.tdatef.nativeElement.value = "";
    this.tdatef._selected = "";
    this.selectApp.selected = "";
    this.selectMod.selected = "";
    this.selectUsers.selected = [];
    this.selectEventos.selected = [];
    this.data = [];
    this.pagination = {
      limit: 5,
      offset: 1,
      count: -1,
      sort: "Id",
      order: "DESC",
    };
    this.configuration.horizontalScroll = false;
    this.IniciaTimerRefresco();
  }

  Buscar() {
    const q: QueryBitacora = {
      Indice: this.pagination.offset - 1,
      TamanoPagina: this.pagination.limit,
      Eventos: [],
      UsuarioIds: [],
      CampoOrdenamiento: this.pagination.sort,
      ModoOrdenamiento: this.pagination.order,
    };

    if (this.tdatei.nativeElement.value != "") {
      q.FechaInicial = this.datei._selected;
    }

    if (this.tdatef.nativeElement.value != "") {
      q.FechaFinal = this.datef._selected;
    }

    try {
      if (this.selectApp.selected != "") {
        q.AppId = this.selectApp.selected;
      }
    } catch (error) {}

    try {
      if (this.selectMod.selected != "") {
        const mod = this.mods.find((a) => a.Id == this.selectMod.selected);
        // Los ids de los módulos desde el backend vienen antepuestos con el Id de la aplicación
        q.ModuloId = mod.Id.replace(`${mod.AplicacionId}-`, "");
      }
    } catch (error) {}

    try {
      if (this.selectEventos.selected.length > 0) {
        const mod = this.mods.find((a) => a.Id == this.selectMod.selected);
        if (mod) {
          this.selectEventos.selected.forEach((e) => {
            const ev = mod.EventosAuditables.find((x) => x.Id == e);
            if (ev) {
              q.Eventos.push(ev);
            }
          });
        }
      }
    } catch (error) {}

    try {
      if (this.selectUsers.selected.length > 0) {
        q.UsuarioIds = this.selectUsers.selected;
      }
    } catch (error) {}

    this.bitacoraService
      .QueryEventos(q)
      .pipe(first())
      .subscribe(
        (l) => {
          this.ProcesaDatos(l);
        },
        (e) => {
          console.error(e);
        }
      );
  }

  private ProcesaDatos(datos: Paginado<EventoAuditoria>) {
    let usuariospendientes: string = "";
    datos.Elementos.forEach((e) => {
      if (this.usaurios.findIndex((u) => u.Id == e.UsuarioId) < 0) {
        usuariospendientes = usuariospendientes + `${e.UsuarioId},`;
      }
    });

    if (usuariospendientes != "") {
      this.bitacoraService
        .UsuariosPorIds(usuariospendientes)
        .pipe(first())
        .subscribe((us) => {
          this.usaurios = this.usaurios.concat(us);
          this.MuestraDatos(datos);
        });
    } else {
      this.MuestraDatos(datos);
    }
  }

  private MuestraDatos(datos: Paginado<EventoAuditoria>) {
    datos.Elementos.forEach((e) => {
      const u = this.usaurios.find((u) => u.Id == e.UsuarioId);
      if (u) {
        e.UsuarioId = u.Texto;
      }

      const app = this.apps.find((a) => a.Id == e.AppId);
      if (app) {
        e.AppId = app.Nombre;
        const mod = app.Modulos.find((m) => m.Id == `${app.Id}-${e.ModuloId}`);
        if (mod) {
          e.ModuloId = mod.Nombre;
          const tipo = `${app.Id}$${mod.Id.replace(
            `${mod.AplicacionId}-`,
            ""
          )}$${e.TipoEntidad}$${e.TipoEvento}`;
          const textoTipo = mod.EventosAuditables.find((x) => x.Id == tipo);
          if (textoTipo) {
            e.TipoEventoTexto = textoTipo.Descripcion;
          }
        }
      }
    });

    this.data = datos.Elementos;
    this.pagination.count = datos.ConteoTotal;
    this.pagination = { ...this.pagination };
    this.configuration.horizontalScroll = true;
    this.IniciaTimerRefresco();
  }

  AppSeleccioanda($event) {
    this.EstableceModulosAppp($event);
  }

  ModSeleccioanda($event) {
    this.EstableceEventosModulo($event);
  }

  EstableceModulosAppp(appId: string) {
    var tmp: ModuloAplicacion[] = [];
    const app = this.apps.find((a) => a.Id == appId);
    if (app) {
      tmp = [...app.Modulos];
    }
    tmp = tmp.sort((a, b) => {
      if (a.Nombre < b.Nombre) {
        return -1;
      }
      if (a.Nombre > b.Nombre) {
        return 1;
      }
      return 0;
    });
    this.mods = tmp;
  }

  public EtiquetasFecha(
    f: Date,
    EntidadId: string,
    column: any,
    rowIndex: any
  ) {
    const fechaSinOffset = new Date(f);
    const fecha = addMinutes(fechaSinOffset, this.timeZoneOffset * -1);
    const texto = format(fecha, "yyyy-MM-dd HH:mm:ss");
    return texto;
  }

  EstableceEventosModulo(modId: string) {
    var tmp: TipoEventoAuditoria[] = [];
    const mod = this.mods.find((a) => a.Id == modId);
    if (mod) {
      tmp = [...mod.EventosAuditables];
    }
    tmp = tmp.sort((a, b) => {
      if (a.Descripcion < b.Descripcion) {
        return -1;
      }
      if (a.Descripcion < b.Descripcion) {
        return 1;
      }
      return 0;
    });
    this.eventos = tmp;
  }
}
