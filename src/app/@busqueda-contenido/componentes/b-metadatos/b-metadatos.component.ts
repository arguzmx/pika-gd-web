import { Component, OnInit, ViewChild } from '@angular/core';
import { first } from 'rxjs/operators';
import { ConfiguracionEntidad, OfflineMetadataBuscadorComponent } from '../../../@editor-entidades/editor-entidades.module';
import { FiltroConsulta } from '../../../@pika/consulta';
import { MetadataInfo, tList } from '../../../@pika/metadata';
import { ServicioBusquedaAPI } from '../../services/servicio-busqueda-api';

@Component({
  selector: 'ngx-b-metadatos',
  templateUrl: './b-metadatos.component.html',
  styleUrls: ['./b-metadatos.component.scss']
})
export class BMetadatosComponent implements OnInit {

  constructor(private servicio: ServicioBusquedaAPI) { }
  public plantillas: unknown[] = [];
  public Topic: string;
  config: ConfiguracionEntidad;
  metadata: MetadataInfo;
  lateral: boolean = true;

  @ViewChild('buscador') buscador: OfflineMetadataBuscadorComponent;

  ngOnInit(): void {
    this.ObtienePlantillas();
  }


  public Filtros(): FiltroConsulta[] {
    const filtros: FiltroConsulta[] = [];
    this.buscador.filtros.filter(x=>x.Valido == true).forEach( f=> {
      // mantener el nulo es para compatibilidad con el backend  
      f.Valor = null;
        filtros.push(f);
    });
    return filtros;
  }


  // Obtiene las plantillas disponibles para el documento
  private ObtienePlantillas(): void {
    this.servicio.ObtienePlantillas().pipe(first())
    .subscribe( (data) => {
      this.plantillas = data;
    }, (e) => {}, () => {});
  }

  public opChange(id: string): void {
    this.Topic = id;
    this.servicio.ObtieneMetadataPlantilla(id)
    .pipe(first()).subscribe( m => {
      this.config = { 
        TipoEntidad: '',
        OrigenTipo: '',
        OrigenId: '',
        TransactionId: '',
        TipoDespliegue: 1,
        Permiso: null
      }
      this.metadata =JSON.parse( JSON.stringify(m));
      
      this.metadata.Propiedades.forEach(p=> {
          if(p.TipoDatoId == tList) {
            if(p.AtributoLista && p.AtributoLista.Valores){
              p.ValoresLista = p.AtributoLista.Valores;
            }
          }
      });
    }, (ex) => {
      console.error(ex);
      this.Topic = null;
    }, () => {} );
  }



  EventoFiltrar(data: unknown): void {
    // console.debug(data);
  }

}
