import { CacheFiltrosBusqueda } from './../services/cache-filtros-busqueda';
import { TranslateService } from '@ngx-translate/core';
import { FiltroConsulta, TextpOperador } from '../../@pika/pika-module';
import { first } from 'rxjs/operators';
import { Output, EventEmitter } from '@angular/core';
import { Propiedad } from '../../@pika/pika-module';
import { ConfiguracionEntidad } from './configuracion-entidad';
import { FormGroup } from '@angular/forms';

export class BuscadorEntidadesBase {

  // Emite cambios en el estado de un filre
  @Output() EstadoFiltro = new EventEmitter();
  @Output() EliminarFiltro = new EventEmitter();

  propiedad: Propiedad;
  config:  ConfiguracionEntidad;
  group: FormGroup;
  ctl1Id: string;
  ctl2Id: string;
  negCtlId: string;
  opCtlId: string;
  lateral: boolean;

  VALID_COLOR: string = 'success';
  INVALID_COLOR: string = 'basic';
  VALID_ICON: string = 'checkmark-circle-2';
  INVALID_ICON: string = 'checkmark-circle-2-outline';

  constructor(
    public cache: CacheFiltrosBusqueda,
    public translate: TranslateService) {
    this.filtro = {
      Negacion: false,
      Propiedad: '',
      Operador: null,
      Valor: [],
    };
  }

  validstatus: string = this.INVALID_COLOR;
  validIcon: string = this.INVALID_ICON;
  filtro: FiltroConsulta;
  operadores: TextpOperador[] = [];

  ObtenerOperadores(ops: string[]): void {
    const keys = ops.map ( x =>  'operadores.' + x);
    this.translate.get(keys).pipe(first()).subscribe( res => {
      ops.forEach( x =>  {
        const t = res['operadores.' + x];
        this.operadores.push({ Texto: t, Operacion: x} );
      });
    });
 }

  setValidIcon(valid: boolean) {
    if (valid) {
      this.validstatus = this.VALID_COLOR;
      this.validIcon = this.VALID_ICON;
    } else {
      this.validIcon = this.INVALID_ICON;
      this.validstatus = this.INVALID_COLOR;
    }
  }

  checkChange(value) {
    this.filtro.Negacion = value;
    this.verificaFiltro();
  }

  opChange(value) {
    this.filtro.Operador = value;
    this.verificaFiltro();
  }

  inputChange(value: any) {
    if (this.filtro.Valor.length === 0) {
      this.filtro.Valor.push(value);
    } else {
      this.filtro.Valor[0] = value;
    }
    this.verificaFiltro();
  }

  input2Change(value: any) {
    if (this.filtro.Valor.length === 0) {
      this.filtro.Valor.push(null);
      this.filtro.Valor.push(value);
    } else {
      if (this.filtro.Valor.length === 1) {
        this.filtro.Valor.push(value);
      } else {
        this.filtro.Valor[1] = value;
      }
    }
    this.verificaFiltro();
  }

  setValorString(valor: string) {
    this.filtro.ValorString = valor;
  }

  // ete metodo debe sobreesciribrse en las clases heredades
  verificaFiltro(): void {}

  closeFilter(): void {

    this.EliminarFiltro.emit(this.filtro);
  }

  public EstableceFltroDefault() {

    const filtros = this.cache.GetCacheFiltros(this.config.TransactionId);
    const index = filtros.findIndex( x => x.Id === this.propiedad.Id);
    if (index >= 0) {
      const f = filtros[index];

      this.filtro.Negacion = f.Negacion;
      this.filtro.Operador = f.Operador;
      this.filtro.Valor = f.Valor;
      this.filtro.ValorString = f.ValorString;

      this.group.get(this.opCtlId).setValue(f.Operador.toString());
      this.group.get(this.negCtlId).setValue(f.Negacion);
      if (f.Valor && f.Valor.length > 0) {
        switch (f.Valor.length) {
          case 1:
            this.group.get(this.ctl1Id).setValue(String(f.Valor[0]));
            break;

            case 2:
              this.group.get(this.ctl1Id).setValue(String(f.Valor[0]));
              this.group.get(this.ctl2Id).setValue(String(f.Valor[0]));
            break;

        }
      }
      this.verificaFiltro();
    }
  }
}
