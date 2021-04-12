import { Component, OnInit } from '@angular/core';
import { ConfiguracionEntidad } from '../../../@editor-entidades/editor-entidades.module';
import { FiltroConsulta, MetadataInfo } from '../../../@pika/pika-module';
import { MetadataElemento } from '../../model/assets/metadata-elemento';

@Component({
  selector: 'ngx-b-propiedades',
  templateUrl: './b-propiedades.component.html',
  styleUrls: ['./b-propiedades.component.scss']
})
export class BPropiedadesComponent implements OnInit {

  config: ConfiguracionEntidad;
  metadata: MetadataInfo;
  lateral: boolean = true;

  constructor() { }

  ngOnInit(): void {
    this.config = {
      TipoEntidad: 'Elemento',
      OrigenTipo: '',
      OrigenId: '',
      TransactionId: 'elemento',
      TipoDespliegue: 1,
      Permiso: null
    };

    this.metadata = MetadataElemento;

  }

  public EventoFiltrar(filtros: FiltroConsulta[]) {
    console.debug(filtros);
  }

}
