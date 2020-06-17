import { FormSearchService } from './../form-search-service';
import { FiltroConsulta } from '../../../../@pika/consulta';

export class SearchFieldBase {
  VALID_COLOR: string = 'success';
  INVALID_COLOR: string = 'basic';
  VALID_ICON: string = 'checkmark-circle-2';
  INVALID_ICON: string = 'checkmark-circle-2-outline';

  constructor(searchService: FormSearchService) {
    this.searchService = searchService;
    this.filtro = {
      Negacion: false,
      Propiedad: '',
      Operador: null,
      Valor: [],
    };
  }

  searchService: FormSearchService;
  validstatus: string = this.INVALID_COLOR;
  validIcon: string = this.INVALID_ICON;
  filtro: FiltroConsulta;

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
    console.log(value);
    if (this.filtro.Valor.length === 0) {
      this.filtro.Valor.push(value);
    } else {
      this.filtro.Valor[0] = value;
    }
    this.verificaFiltro();
  }

  input2Change(value: any) {
    console.log(value);
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

  verificaFiltro(): void {}
}
