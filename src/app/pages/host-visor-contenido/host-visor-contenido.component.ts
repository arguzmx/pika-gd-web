import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IUploadConfig } from '../../@visor-imagenes/visor-imagenes.module';

@Component({
  selector: 'ngx-host-visor-contenido',
  templateUrl: './host-visor-contenido.component.html',
  styleUrls: ['./host-visor-contenido.component.scss']
})
export class HostVisorContenidoComponent implements OnInit {

  constructor(private route: ActivatedRoute) { }
  public config: IUploadConfig;

  public NewGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0,
        v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  public ParamListener(): void {
    this.route
      .queryParams
      .subscribe(params => {
        // Defaults to 0 if no query param provided.
        this.config = { ElementoId: params['Id'],
        VolumenId: params['VolumenId'],
        PuntoMontajeId: params['PuntoMontajeId'],
        Nombre: params['Nombre'],
        TransactionId: this.NewGuid(),
        VersionId: params['VersionId'],
        CarpetaId: params['CarpetaId']
       };
      });
  }

  ngOnInit(): void {
    this.ParamListener();
  }
}
