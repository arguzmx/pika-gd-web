import { Component, OnInit, ViewChild, Inject, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { UploadService } from '../../../services/uploader.service';
import {
  MatBottomSheetRef,
  MAT_BOTTOM_SHEET_DATA,
} from '@angular/material/bottom-sheet';
import { forkJoin, Subject, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { first } from 'rxjs/operators';
import { InfoService } from '../../../services/info.service';

@Component({
  selector: 'ngx-file-drop',
  templateUrl: './file-drop.component.html',
  styleUrls: ['./file-drop.component.scss'],
})
export class FileDropComponent implements OnInit, OnDestroy {
  @ViewChild('file', { static: false }) file;

  //#region drag zone variables
  accept: string;
  maxSize: number;
  posicionInicio: number;
  files: any[] = [];
  selectable = false;
  hasBaseDropZoneOver = false;
  httpEmitter: Subscription;
  lastFileAt: Date;
  sendableFormData: FormData;
  dragFiles: any;
  validComboDrag: any;
  lastInvalids: any;
  fileDropDisabled: any;
  baseDropValid: any;
  selectedAdicionId: string = "1";
  //#endregion

  //#region upload variables
  progress: any;
  uploadSuccessful = false;
  uploading = false;
  subjectProgresoGlobal = new Subject<number>();
  progresoGlobal: number = 0;

  //#endregion


  private uploadService: UploadService;

  // Claves para obtener la traducción
  ts: string[];

  // Objeto resultante de la traduccion
  t: object;

  private onDestroy$: Subject<void> = new Subject<void>();
  constructor(private ref: ChangeDetectorRef,
    private translate: TranslateService,
    private infoService: InfoService,
    public bottomSheetRef: MatBottomSheetRef<FileDropComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any) {
    this.accept = data.accept;
    this.maxSize = data.maxSize;
    this.posicionInicio = data.posicionInicio;
    this.uploadService = data.uploadService;
  }

  ngOnInit(): void {
    this.CargaTraducciones();
  }

  ngOnDestroy(): void {
    this.onDestroy$.next(null);
    this.onDestroy$.complete();
    this.infoService.data.next(true);
  }

  private CargaTraducciones() {
    this.ts = [
      'ui.enviar',
      'ui.cancelar',
      'ui.eliminar-todo',
      'ui.elegir-ellipsis',
      'ui.archivos-sel',
      'ui.al-inicio',
      'ui.al-final',
      'ui.al-posicion',
    ];
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

  cancel() {
    this.progress = 0;
    if (this.httpEmitter) {
      this.httpEmitter.unsubscribe();
    }
  }

  uploadFiles() {
    console.log(this.selectedAdicionId);
    this.progresoGlobal = 0;
    this.bottomSheetRef.disableClose = true;
    this.uploading = true;
    this.files = this.files.filter(x => !x.subido);

    if (this.files.length > 0) {
      let i = 0;
      let subido = false;

      // El servivio emite el evento de actualización de páginas al finalizar
      this.uploadService.Posicion = parseInt(this.selectedAdicionId, 10);
      this.uploadService.PosicionInicio = this.posicionInicio;
      this.progress = this.uploadService.upload(this.files);

      // tslint:disable-next-line: forin
      for (const key in this.progress) {
        i++;
        this.progress[key].progress.subscribe((val) => {
          this.progresoGlobal = Math.round((val.progreso * i) / this.files.length);
          if (val.progreso === 100 && val.status === 200)
            subido = true;
          else
            subido = false;

          this.ActualizaUIArchivo(this.files.find(x => x.name === key), subido);
          this.ref.detectChanges();
        },
          error => {
            this.ActualizaUIArchivo(this.files.find(x => x.name === key), subido);
            this.LimpiaUIArchivos();
          }, () => {
            this.LimpiaUIArchivos();
          });
      }

      // convert the progress map into an array
      const allProgressObservables = [];
      // tslint:disable-next-line: forin
      for (const key in this.progress) {
        allProgressObservables.push(this.progress[key].progress);
      }

      forkJoin(allProgressObservables).subscribe((end) => {
        this.LimpiaUIArchivos();
      });
    } else
      this.LimpiaUIArchivos();
  }

  ActualizaUIArchivo(file: any, exito: boolean) {
    file.subido = exito;
    file.style = exito ? 'text-success' : 'text-danger';

  }

  LimpiaUIArchivos() {
    // ... the dialog can be closed now...
    this.bottomSheetRef.disableClose = false;
    // ... the upload was successful...
    this.uploadSuccessful = true;
    // ... and the component is no longer uploading
    this.uploading = false;
    this.ref.detectChanges();
  }

  EstablecePropiedades() {
    this.LimpiaUIArchivos();
    if (this.files.length > 0) {
      this.files.forEach(f => {
        if (!f.style) {
          f.style = '';
          f.subido = false;
        }
      });
    }
  }

  getDate() {
    return new Date();
  }
}

