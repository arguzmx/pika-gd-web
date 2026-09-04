import { Component, Input, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';
import { Traductor } from '../../../@editor-entidades/editor-entidades.module';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { listRangeValidator } from '../../validators/list-range-validator';
import { ExportPaginado } from '../../model/export-paginado';

@Component({
  selector: "ngx-pdf-download",
  templateUrl: "./pdf-download.component.html",
  styleUrls: ["./pdf-download.component.scss"],
})
export class PdfDownloadComponent implements OnInit {
  form: FormGroup;

  paginasTodas: boolean = true;
  paginasIntervalo: boolean = false;
  paginasLista: boolean = false;
  tipoPagina: string = '0';

  // selectporciento
  public T: Traductor;
  @Input() titulo: string;
  @Input() maxValue: number =1;
  @Input() mostrarPorcentaje: boolean = false;

  private pdfporciento: number = 100;
  constructor(
    protected ref: NbDialogRef<PdfDownloadComponent>,
    private fb: FormBuilder,
    ts: TranslateService
  ) {
    this.T = new Traductor(ts);
    this.form = this.fb.group({
      paginaDe: [null] ,
      paginaA: [null] ,
      paginaList: [null] ,
    });
  }

  setRange(min: number, max: number) {
    const paginaDe = this.form.get('paginaDe');
    paginaDe.setValue(min);
    paginaDe?.setValidators([Validators.min(min), Validators.max(max)]);
    paginaDe?.updateValueAndValidity();
    paginaDe.setValue(1);

    const paginaA = this.form.get('paginaA');
    paginaA?.setValidators([Validators.min(min), Validators.max(max)]);
    paginaA?.updateValueAndValidity();
    paginaA.setValue(max);

    const paginaList = this.form.get('paginaList');
    paginaList?.setValidators([listRangeValidator(min, max)]);
    paginaList?.updateValueAndValidity();
    paginaList.setValue('');
  }

  clearFormData() { 
    const paginaDe = this.form.get('paginaDe');
    paginaDe.setValue(1);

    const paginaA = this.form.get('paginaA');
    paginaA.setValue(this.maxValue  );

    const paginaList = this.form.get('paginaList');
    paginaList.setValue('');
  }

  ngOnInit(): void {
    this.CargaTraducciones();
    this.setRange(1,this.maxValue);
  }

  private CargaTraducciones() {
    this.T.ts = [
      "ui.cancelar",
      "ui.aceptar",
      "componentes.visor-documento.porciento-pdf",
      "componentes.visor-documento.paginas-selector",
      "componentes.visor-documento.paginas-rango",
      "componentes.visor-documento.paginas-lista",
      'componentes.visor-documento.paginas-lista-error',
    ];
    this.T.ObtenerTraducciones();
  }

  cerrar() {
    this.ref.close({ confirma: false, porciento: 100 });
  }

  aceptar() {

    const paginado: ExportPaginado = {
      Porcentaje: this.mostrarPorcentaje ? this.pdfporciento : 0,
      Tipo: Number(this.tipoPagina),
      Paginas: this.getRange(),
    } ;

    this.ref.close({ confirma: true,  paginado: paginado });
  }

  getRange(): number[] {
     const paginaDe = this.form.get('paginaDe');
      const paginaA = this.form.get('paginaA');
      const paginaList = this.form.get('paginaList');

    switch (this.tipoPagina) {
      case "1":
        return [parseInt(paginaDe?.value) , parseInt(paginaA?.value)];

      case "2":
        return paginaList?.value.split(',').map((v: string) => parseInt(v.trim()));
    }

    return [];
  }

  porciento(p: string) {
    this.pdfporciento = parseInt(p);
  }

  paginas($event: any) {
    this.clearFormData();
    switch ($event) {
      case "0":
        this.paginasIntervalo = false;
        this.paginasLista = false;
        this.paginasTodas = true;
        break;
      case "1":
        this.paginasIntervalo = true;
        this.paginasTodas = false;
        this.paginasLista = false;
        break;

      case "2":
        this.paginasLista = true;
        this.paginasIntervalo = false;
        this.paginasTodas = false;
        break;
    }
  }
}
