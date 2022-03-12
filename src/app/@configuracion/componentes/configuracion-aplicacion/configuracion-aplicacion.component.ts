import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { first } from 'rxjs/operators';
import { Traductor } from '../../../@editor-entidades/editor-entidades.module';
import { AppLogService } from '../../../services/app-log/app-log.service';
import { ActDominioOU } from '../../model/act-dominio-ou';
import { ApiConfiguracion } from '../../services/api-configuracion';

@Component({
  selector: 'ngx-configuracion-aplicacion',
  templateUrl: './configuracion-aplicacion.component.html',
  styleUrls: ['./configuracion-aplicacion.component.scss'],
  providers: [ApiConfiguracion],
})
export class ConfiguracionAplicacionComponent implements OnInit {

  cargandoSalud: boolean = true;
  domainForm: FormGroup;
  public T: Traductor;

  constructor(
    formBuilder: FormBuilder,
    ts: TranslateService,
    private applog: AppLogService,
    private api: ApiConfiguracion
  ) {

    this.T = new Traductor(ts);
    this.domainForm = formBuilder.group({
      dominio: ['', [Validators.required, Validators.minLength(2)]],
      unidad: ['', [Validators.required, Validators.minLength(2)]],
    });

  }

  estadoCargaSalud(estadoCarga: boolean) {
    this.cargandoSalud = !estadoCarga;
  }

  ngOnInit(): void {
    this.CargaTraducciones();    
    this.DatosIniciales();
  }


  onDominioUpdate () {
    this.api.ActualizaDominioOU(
      this.domainForm.get('dominio').value, 
      this.domainForm.get('unidad').value).pipe(first()).subscribe(r=> {
      this.ErrorDominioOU(0);
    }, (err) => { this.ErrorDominioOU(parseInt(err.status));   });
  }
  
  ErrorDominioOU(err: number) {
    switch (err) {
      case 0:
        this.applog.ExitoT('ui.dominio-unidad-cambio-ok');
        break;
       
      default:
        this.applog.FallaT('ui.dominio-unidad-cambio-err')
        break;
    }
  }


  private CargaTraducciones() {
    this.T.ts = [
      'ui.actualizar',
      'titulo.configuracion-sistema',
      'ui.dominio-actualizar',
      'ui.dominio-dominio-actualizar',
      'ui.dominio-unidad-actualizar',
      'componentes.monitor-salud.titulo'
    ];
    this.T.ObtenerTraducciones();
  }

  private DatosIniciales() {

    const dominioOu = this.api.ObtieneDominioOU().pipe(first());

    forkJoin([dominioOu]).subscribe(resultados => {
      
      this. updateDominioOU (resultados [0]);
    });
    
  }

  updateDominioOU(data: ActDominioOU) {
    this.domainForm.get('dominio').setValue(data.Dominio);
    this.domainForm.get('unidad').setValue(data.OU);
  }



}
