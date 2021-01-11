import { OfflineMetadataEditorComponent } from './../../../@editor-entidades/components/metadata-editor/offline-metadata-editor.component';
import { first } from 'rxjs/operators';
import { Component, Input, OnInit, ViewEncapsulation, AfterViewInit, ViewChild } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { ConfiguracionEntidad } from '../../../@editor-entidades/model/configuracion-entidad';
import { MetadataInfo, TipoDespliegueVinculo } from '../../../@pika/metadata';
import { DocumentosService } from '../../services/documentos.service';
import { AppLogService } from '../../../@pika/servicios';
import { DocumentoPlantilla, RequestValoresPlantilla, ValorPropiedad } from '../../../@pika/pika-module';
@Component({
  selector: 'ngx-dialog-metadata',
  templateUrl: './dialog-metadata.component.html',
  styleUrls: ['./dialog-metadata.component.scss'],
  providers: [DocumentosService],
  encapsulation: ViewEncapsulation.None,
})
export class DialogMetadataComponent implements OnInit, AfterViewInit {

  @ViewChild('editor') editor: OfflineMetadataEditorComponent;
  @Input() data: string;
  @Input() documento: DocumentoPlantilla;
  config: ConfiguracionEntidad;
  metadata: MetadataInfo;
  entidad: any;
  public cargandoMetadatos: boolean = true;

  constructor(
    protected ref: NbDialogRef<DialogMetadataComponent>,
    protected servicio: DocumentosService,
    private applog: AppLogService) {
    }

  ngAfterViewInit(): void {
    this.servicio.ObtieneMetadataInfo(this.data)
    .pipe(first()).subscribe( m => {
      const temp: MetadataInfo =JSON.parse( JSON.stringify(m));
      if (this.documento !== null){
        temp.Propiedades.forEach(p => {
          p.ValorDefault = this.documento.Valores.find(x=>x.PropiedadId === p.Id).Valor
        });
      }

      this.metadata = temp;

      this.config = {
        TipoEntidad: this.data,
        OrigenTipo: null,
        OrigenId: null,
        TransactionId: "123",
        TipoDespliegue: TipoDespliegueVinculo.Tabular,
        Permiso: null
      }
      this.cargandoMetadatos = false;
    }, (ex) => {
      this.ref.close();
    }, () => {} );
  }

  ngOnInit(): void {
    
  }

  cancel() {
    this.ref.close(null);
  }

  public NuevaEntidad(entidad: any) {

  }

  public CapturaFinalizada(entidad: any) {

  }

  public EntidadActualizada(entidad: any) {

  }


  public CrearEntidad(): void {
    if (this.editor.EntidadValida()) {
      const request = this.CreaRequest(this.editor.ObtieneEntidad());
      this.ref.close(request);
    } else {
      this.applog.Advertencia("","Los datos introducidos no son válidos");
    }
  }

  private CreaRequest(object: unknown): RequestValoresPlantilla {
    const request: RequestValoresPlantilla = {
      Tipo: '',
      Id: '',
      Filtro: '',
      Valores: []
    };

    if (this.documento!=null) {
      request.Id = this.documento.Id;
    }

    for (let [key, value] of Object.entries(object)) {
      const propiedad: ValorPropiedad = {
        PropiedadId: key,
        Valor: JSON.stringify(value).replace('"','').replace('"','')
      }
      request.Valores.push(propiedad);
    }

    return request;
  }


}
