import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { TranslateService } from '@ngx-translate/core';
import { format } from 'date-fns';
import { Columns, Config, DefaultConfig } from 'ngx-easy-table';
import { first } from 'rxjs/operators';
import { Traductor } from '../../../@editor-entidades/editor-entidades.module';
import { PostTareaEnDemanda } from '../../../@pika/pika-module';
import { AppConfig } from '../../../app-config';
import { AppLogService } from '../../../services/app-log/app-log.service';
import { CanalTareasService } from '../../../services/canal-tareas/canal-tareas.service';

@Component({
  selector: 'ngx-centro-mensajes',
  templateUrl: './centro-mensajes.component.html',
  styleUrls: ['./centro-mensajes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CentroMensajesComponent implements OnInit {
  public configuration: Config;
  public columns: Columns[];
  public tareas: PostTareaEnDemanda[] = [];
  @ViewChild('boolTpl', { static: true }) boolTpl: TemplateRef<any>;
  @ViewChild('fechaTpl', { static: true }) fechaTpl: TemplateRef<any>;
  @ViewChild('etiquetaTpl', { static: true }) etiquetaTpl: TemplateRef<any>;
  @ViewChild('closeTpl', { static: true }) closeTpl: TemplateRef<any>;
  public T: Traductor;
  
  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    private cdr: ChangeDetectorRef,
    private appLog: AppLogService,
    private appConfig: AppConfig,
    private canalTareasService: CanalTareasService,
    private _bottomSheetRef: MatBottomSheetRef<CentroMensajesComponent>,
    translate: TranslateService,
    private http: HttpClient) {
      this.tareas = data.tareas;
      this.T = new Traductor(translate);
    }

    public EtiquetasFecha(f: Date, column: any, rowIndex: any) {
      const dd = new Date(f);
      const texto = format(dd, 'dd/MM/yyyy');
      return texto;
    }

  openLink(event: MouseEvent): void {
    this._bottomSheetRef.dismiss();
    event.preventDefault();
  }

  public eventosTabla($event) {
    console.log($event);
  }

  EliminarTarea(Id: string) {
    this.canalTareasService.EliminarTarea(Id).pipe(first())
    .subscribe(r=> {
        const index = this.tareas.findIndex(x=>x.Id == Id);
        if (index >= 0){
          this.tareas.splice(index, 1);
        } 
        this.tareas = JSON.parse(JSON.stringify(this.tareas));
        this.cdr.detectChanges();
    },  (err) => {})
  }

  private getFileNameFromHttpResponse(httpResponse: HttpResponse<Blob>): string {
    var contentDispositionHeader = httpResponse.headers.get('Content-Disposition');
    var result = contentDispositionHeader.split(';')[1].trim().split('=')[1];
    return result.replace(/"/g, '');
  }

  DescargaBLOB(id: string) {
    const tarea = this.tareas.find(x=>x.Id == id);
    if (tarea) {
      const headers = new HttpHeaders();
      const u = this.ObtieneRutas(tarea.PickupURL);
      console.log(tarea.PickupURL);
      console.log(u);
      this.http.get(u, { observe: 'response', headers, responseType: 'blob' as 'json' }).subscribe(
        (response: HttpResponse<Blob>) => {
          const binaryData = [];
          binaryData.push(response.body);
          const downloadLink = document.createElement('a');
          downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, { type: response.type.toString() }));
          downloadLink.setAttribute('download', this.getFileNameFromHttpResponse(response));
          document.body.appendChild(downloadLink);
          downloadLink.click();
        },
        (err) => {
          console.warn(err);
        },
      );
    } else {
        this.appLog.AdvertenciaT('componentes.canal-tareas.tareas-desconocida');
    }
  }

  public ObtieneRutas(endpoint: string): string {
    let url = this.appConfig.config.pikaApiUrl.replace(/\/$/, '') + '/';
    url = url + `api/v${this.appConfig.config.apiVersion}/${endpoint}`.replace('//','/');
    return url;
  }

  ngOnInit(): void {
    this.CargaTraducciones();
    this.columns = [
      { key: 'Completado', title: '', cellTemplate: this.boolTpl, width: '10%' },
      { key: 'Fecha', title: 'Fecha', cellTemplate: this.fechaTpl, width: '30%' },
      { key: 'Etiqueta', title: 'Tarea', width: '40%' },
      { key: 'Completado', title: '', cellTemplate: this.closeTpl, width: '10%' },
      { key: 'Etiqueta', title: '', cellTemplate: this.etiquetaTpl, width: '10%' },
    ];
    this.configuration = { ...DefaultConfig };
    this.configuration.paginationEnabled = false;
  }

  private CargaTraducciones(): void {
    this.T.ts = ['componentes.canal-tareas.sin-tareas'];
    this.T.ObtenerTraducciones();
  }
}
