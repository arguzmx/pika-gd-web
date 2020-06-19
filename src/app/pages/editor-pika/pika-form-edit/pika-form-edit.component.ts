
import { MetadataInfo } from './../../../@pika/metadata/metadata-info';
import { Propiedad } from './../../../@pika/metadata/propiedad';
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { EditorService } from '../services/editor-service';
import { NbToastrService } from '@nebular/theme';
import { takeUntil } from 'rxjs/operators';
import { tBoolean, tInt32, tInt64, tDouble, tDate, tDateTime, tTime } from '../../../@pika/metadata';
import { isDate, parseISO } from 'date-fns';

@Component({
  selector: 'ngx-pika-form-edit',
  templateUrl: './pika-form-edit.component.html',
  styleUrls: ['./pika-form-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation: ViewEncapsulation.None,
})
export class PikaFormEditComponent implements OnInit, OnDestroy {
  public formaDinamica: FormGroup;
  public metadatos: MetadataInfo;

  private onDestroy$: Subject<void> = new Subject<void>();

  constructor(
    private editorService: EditorService,
    private toastrService: NbToastrService,
    private fb: FormBuilder,
  ) {}


  regenerarForma(): void {
    // Onbtiene la lista de controles exietnets
      const controls = Object.keys(this.formaDinamica.controls);

      // Obtiene los objetos de la configuración en base a la lista de nombres
      const configControls = this.metadatos.Propiedades.map((item) => item.Id);

  console.log(configControls);

      // Para cada control que no se encuentre en la lista de existentes
      // Elimina cada control que spertenezca a la configurcion actual
      controls
        .filter((control) => !configControls.includes(control))
        .forEach((control) => {
          this.formaDinamica.removeControl(control);
           });

      // Crea los controles faltantes
      configControls
        .filter((control) => !controls.includes(control))
        .forEach((Id) => {
          const config = this.metadatos.Propiedades.find((control) => control.Id === Id);
          this.formaDinamica.addControl( config.Id, this.createControl(config));
        });
  }

  crearEntidad() {

    console.log( this.formaDinamica);

  }



  
  ngOnDestroy(): void {
    this.onDestroy$.next();
  }

  ngOnInit(): void {
    this.formaDinamica = this.createGroup();
    this.ObtieneMetadatosListener();
  }

  ObtieneMetadatosListener() {
    this.editorService
      .ObtieneMetadatosDisponibles()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((metadatos) => {
        if (metadatos) {
          this.metadatos = metadatos;
          this.regenerarForma();
        }
      });
  }



  createGroup() {
    const group = this.fb.group({});
    return group;
  }


  getValor(Valor: string, p: Propiedad): any {


    if (Valor && Valor !== '' ) {

      switch (p.TipoDatoId) {
        case tBoolean:
        if (Valor.toLowerCase() === 'true' || Valor === '1' ) {
          return true;
        } else {
          return false;
        }

        case tInt32:
        case tInt64:
          if (!isNaN(+Valor)) {
            return parseInt(Valor, 10);
        }
        break;

        case tDouble:
        if (!isNaN(+Valor)) {
            return parseFloat(Valor);
        }
        break;

        case tDate:
        case tDateTime:
        case tTime:
        if (isDate(Valor)) {
            return parseISO(Valor);
        }
        break;

        default:
          return Valor;
      }

    }

    return null;
  }

  createControl(p: Propiedad) {
    const validadorres = [];

    if (p.Requerido) {
      validadorres.push(Validators.required);
    }

    if (p.ValidadorTexto) {
      validadorres.push(Validators.minLength(p.ValidadorTexto.longmin));
      validadorres.push(Validators.maxLength(p.ValidadorTexto.longmax));
    }


    if (p.ValidadorNumero) {
      validadorres.push(Validators.min(p.ValidadorNumero.min));
      validadorres.push(Validators.max(p.ValidadorTexto.longmax));
    }

    let valor =  this.getValor(p.Valor, p);
    if (!valor) {
      valor =  this.getValor(p.ValorDefault, p);
    }

    return this.fb.control({ disabled: false, value: valor }, validadorres);

  }






}
