import { IUploadConfig } from './../../model/i-upload-config';
import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { FileDropComponent } from './file-drop/file-drop.component';
import { VisorImagenesService } from '../../services/visor-imagenes.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UploadService } from '../../services/uploader.service';


@Component({
  selector: 'ngx-uploader',
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.scss'],
})
export class UploaderComponent implements OnInit, OnDestroy {
  @Input() accept: string;
  @Input() config: IUploadConfig;
  @Input() maxSize: number; // bytes . 1024 = 1kb . 1048576 b = 1mb . 10485760 b = 10 mb

  // Identifica el indice máximo en las paginas seleccionadas para realizar una inserción
  private MaxIndice: number = 0;

  private onDestroy$: Subject<void> = new Subject<void>();
  constructor(
    public bottomSheet: MatBottomSheet,
    public dialog: MatDialog,
    public uploadService: UploadService,
    private servicioVisor: VisorImagenesService) { }

  ngOnDestroy(): void {
    this.onDestroy$.next(null);
    this.onDestroy$.complete();
  }

  ngOnInit(): void {
    this.ConfiguraObservables();
  }


  ConfiguraObservables() {
    this.servicioVisor.ObtieneAbrirUpload()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(abrir => {
        if (abrir) {
          this.openUploadSheet();
          this.servicioVisor.EstableceAbrirUpload(false);
        }
      });

    this.servicioVisor.ObtienePaginasSeleccionadas()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((p) => {
        this.MaxIndice = 0;
        if (p.length > 0) {
          p.forEach(pagina => {
            if (pagina.Indice > this.MaxIndice) {
              this.MaxIndice = pagina.Indice;
            }
          });
        }
      });
  }


  public openUploadSheet() {
    const bottomSheetRef = this.bottomSheet.open(FileDropComponent, {
      ariaLabel: 'Elegir archivos',
      data: { accept: this.accept, maxSize: this.maxSize, uploadService: this.uploadService, posicionInicio: this.MaxIndice },
    });
  }
}
