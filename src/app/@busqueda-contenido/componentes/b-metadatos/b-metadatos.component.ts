import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { ConfiguracionEntidad } from '../../../@editor-entidades/editor-entidades.module';
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
  config: ConfiguracionEntidad;
  metadata: MetadataInfo;
  lateral: boolean = true;


  ngOnInit(): void {
    this.ObtienePlantillas();
  }

  // Obtiene las plantillas disponibles para el documento
  private ObtienePlantillas(): void {
    this.servicio.ObtienePlantillas().pipe(first())
    .subscribe( (data) => {
      this.plantillas = data;
    }, (e) => {}, () => {});
  }

  public opChange(id: string): void {
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
    }, () => {} );
  }



  EventoFiltrar(data: unknown): void {
    console.debug(data);
  }

}
