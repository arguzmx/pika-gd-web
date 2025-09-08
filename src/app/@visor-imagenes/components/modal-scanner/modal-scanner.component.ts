import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IUploadConfig } from '../../visor-imagenes.module';
import { PosicionCarga, TokenScannerRequest } from '../../model/scanner';
import { UploadService } from '../../services/uploader.service';
import { TranslateService } from '@ngx-translate/core';
import { Traductor } from '../../../@editor-entidades/editor-entidades.module';

@Component({
  selector: 'ngx-modal-scanner',
  templateUrl: './modal-scanner.component.html',
  styleUrls: ['./modal-scanner.component.scss']
})
export class ModalScannerComponent implements OnInit {
  PosicionCarga = PosicionCarga;

  opcionSeleccionada: PosicionCarga = PosicionCarga.al_final;

  numeroPagina: number | null = null;
  cargando = false;

  public T: Traductor;

  constructor(
    private dialogRef: MatDialogRef<ModalScannerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private ts: TranslateService
  ) {
    this.T = new Traductor(ts);
  }

  ngOnInit(): void {
    this.CargaTraducciones();
  }

 aceptar() {
    const newWindow = window.open('', '_blank');
    const modo = this.opcionSeleccionada ?? PosicionCarga.al_final;

    if (modo === PosicionCarga.en_posicion && (!this.numeroPagina || this.numeroPagina < 1)) {
      alert('Por favor, ingresa un número de página válido.');
      return;
    }

    const payload: TokenScannerRequest = {
      ElementoId: this.data.config.ElementoId,
      VersionId: this.data.config.VersionId,
      Posicion: modo,
      PosicionInicio: modo === PosicionCarga.en_posicion ? this.numeroPagina : 0
    };

    this.cargando = true;

    this.data.uploadService.CreaTokenScanner(payload)
    .subscribe({
      next: (e) => {
        if(e){
          const scannerUrl = this.generarDeeplink(e);
          newWindow.location.href = scannerUrl;
          this.dialogRef.close();
        } else {
          this.cargando = false;
          newWindow.close();
          console.error('No se recibió token');
        }
      },
      error: (err) => {
        this.cargando = false;
        newWindow.close();
        console.error('Error al generar token:', err);
      }
    });
  }

  cancelar() {
    this.dialogRef.close();
  }

  generarDeeplink(data: any): string {
    return `pikascan://?token=${data}`;
  }

  //Auxiliares UI
  private CargaTraducciones() {
    this.T.ts = [
      'ui.modal-scanner-titulo',
      'ui.modal-scanner-alinicio',
      'ui.modal-scanner-alfinal',
      'ui.modal-scanner-enposicion',
      'ui.modal-scanner-aceptar',
      'ui.modal-scanner-cargando...'
    ];
    this.T.ObtenerTraducciones();
  }

}
