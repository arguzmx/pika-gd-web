import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IUploadConfig } from '../../@uploader/uploader.module';

@Component({
  selector: 'ngx-host-visor-contenido',
  templateUrl: './host-visor-contenido.component.html',
  styleUrls: ['./host-visor-contenido.component.scss']
})
export class HostVisorContenidoComponent implements OnInit {

  constructor(private route: ActivatedRoute) { }
  public config: IUploadConfig;

  public ParamListener(): void {
    this.route
      .queryParams
      .subscribe(params => {
        // Defaults to 0 if no query param provided.
        this.config = { ElementoId: params['Id'],
        VolumenId: params['VolumenId'],
        PuntoMontajeId: params['PuntoMontajeId'],
        Nombre: params['Nombre'] };
      });
  }

  ngOnInit(): void {
    this.ParamListener();
  }
}
