import { first } from 'rxjs/operators';
import { Component, Input, OnInit, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { ConfiguracionEntidad } from '../../../@editor-entidades/model/configuracion-entidad';
import { MetadataInfo, TipoDespliegueVinculo } from '../../../@pika/metadata';
import { DocumentosService } from '../../services/documentos.service';
@Component({
  selector: 'ngx-dialog-metadata',
  templateUrl: './dialog-metadata.component.html',
  styleUrls: ['./dialog-metadata.component.scss'],
  providers: [DocumentosService],
  encapsulation: ViewEncapsulation.None,
})
export class DialogMetadataComponent implements OnInit, AfterViewInit {

  @Input() data: string;
  config: ConfiguracionEntidad;
  metadata: MetadataInfo;
  entidad: any;
  public cargandoMetadatos: boolean = true;

  constructor(
    protected ref: NbDialogRef<DialogMetadataComponent>,
    protected servicio: DocumentosService) {
    }

  ngAfterViewInit(): void {
    this.servicio.ObtieneMetadataInfo(this.data)
    .pipe(first()).subscribe( m => {
      console.log(m);
      this.metadata = m;

      this.config = {
        TipoEntidad: this.data,
        OrigenTipo: null,
        OrigenId: null,
        TransactionId: "123",
        TipoDespliegue: TipoDespliegueVinculo.Tabular,
        Permiso: null
      }
      this.cargandoMetadatos = false;
    }, (ex) => {}, () => {} );
  }

  ngOnInit(): void {
    
  }

  cancel() {
    this.ref.close();
  }

  submit(name) {
    this.ref.close(name);
  }

  public NuevaEntidad(entidad: any) {

  }

  public CapturaFinalizada(entidad: any) {

  }

  public EntidadActualizada(entidad: any) {

  }

}
