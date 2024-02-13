import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { forkJoin } from "rxjs";
import { first } from "rxjs/operators";
import { ApiConfiguracion } from "../../@configuracion/services/api-configuracion";
import { Traductor } from "../../@editor-entidades/editor-entidades.module";
import { ValorListaOrdenada } from "../../@pika/pika-module";
import { AppLogService } from "../../services/app-log/app-log.service";

@Component({
  selector: "ngx-activacion",
  templateUrl: "./activacion.component.html",
  styleUrls: ["./activacion.component.scss"],
  providers: [ApiConfiguracion],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivacionComponent implements OnInit {
  @Output() CodigoActivacion = new EventEmitter();
  @Output() Activado = new EventEmitter();
  @Output() AccesoServidorRegistro = new EventEmitter();
  
  public T: Traductor;
  propsForm: FormGroup;
  activacionForm: FormGroup;
  paises: ValorListaOrdenada[] = [];
  medios: ValorListaOrdenada[] = [];
  accesoRegistro:boolean = false;
  ocupado: boolean =false;
  activarConClave: boolean =false;

  constructor(
    formBuilder: FormBuilder,
    ts: TranslateService,
    private applog: AppLogService,
    private api: ApiConfiguracion,
    private cdr: ChangeDetectorRef,
  ) {
    this.T = new Traductor(ts);
    this.propsForm = formBuilder.group({
      Email: ['oswaldo.dgmx@gmail.com', [Validators.required, Validators.email]],
      Nombre: ['Oswaldo Díaz', [Validators.required, Validators.minLength(4)]],
      PaisId: ['MEX',[Validators.required]],
      MedioEnterado: ['Otro',[Validators.required]],
      Empresa: [null],
      Puesto: [null],
      PaginaWeb: [null],
      Telefono: [null],
      FingerPrint: [''],
      MedioOtro: [null],
      RequiereContacto: [false]
    });

    this.activacionForm = formBuilder.group({
      inputCodigo: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.CargaTraducciones();    
    this.DatosIniciales();
    this.EstableceMedios();
  }

  private EstableceMedios() {

    this.T.ObtenerTraduccion([
    'ui.activacion-medio-recomendacion-personal',
    'ui.activacion-medio-busqueda-web',
    'ui.activacion-medio-email',
    'ui.activacion-medio-anuncio',
    'ui.activacion-medio-conferencia',
    'ui.activacion-medio-otro']).subscribe(t=> {
      this.medios.push({Id: "RecomendacionPersonal", Texto: t['ui.activacion-medio-recomendacion-personal'], Indice: 0 });
      this.medios.push({Id: "BusquedaWeb", Texto: t['ui.activacion-medio-busqueda-web'], Indice: 0 });
      this.medios.push({Id: "Email", Texto: t['ui.activacion-medio-email'], Indice: 0 });
      this.medios.push({Id: "Anuncio", Texto: t['ui.activacion-medio-anuncio'], Indice: 0 });
      this.medios.push({Id: "Conferencia", Texto: t['ui.activacion-medio-conferencia'], Indice: 0 });
      this.medios.push({Id: "Otro", Texto: t['ui.activacion-medio-otro'], Indice: 0 });
    });
  }

  private CargaTraducciones() {
    this.T.ts = [
      'ui.activacion-pais',
      'ui.activacion-email',
      'ui.activacion-nombre',
      'ui.activacion-empresa',
      'ui.activacion-puesto',
      'ui.activacion-www',
      'ui.activacion-telefono',
      'ui.activacion-medioenterado',
      'ui.activacion-fingerprint',
      'ui.activacion-otro-comentarios',
      'ui.activacion-titulo',
      'ui.activacion-registrar',
      'ui.activacion-requiere-contacto',
      'ui.activacion-codigo',
      'ui.tengo-codigo',
      'ui.activacion-clave-titulo'
    ];
    this.T.ObtenerTraducciones();
  }


  toggleConClave() {
    this.activarConClave = !this.activarConClave;
  }


  activarClave() {
    this.ocupado=true;
    this.api.ActivarServidor(this.activacionForm.get("inputCodigo").value).pipe(first())
    .subscribe(done=> {
      this.applog.ExitoT('ui.activacion-activar-ok');
      this.Activado.emit(true);
      this.ocupado=false; this.cdr.detectChanges();
    }, (err)=> { 
      console.error(err);this.applog.ExitoT('ui.activacion-activar-error');
      this.ocupado=false; this.cdr.detectChanges(); });
  }

  registrar() {
    this.ocupado=true;
    const form =  JSON.stringify(this.propsForm.value);
    this.api.GenerarRegistro(form).pipe(first())
    .subscribe(done=> {
      this.applog.ExitoT('ui.activacion-generar-ok');
      this.ocupado=false; this.cdr.detectChanges();
    }, (err)=> { 
      console.error(err);this.applog.ExitoT('ui.activacion-generar-error');
      this.ocupado=false; this.cdr.detectChanges(); });
  }

  private DatosIniciales() {

    const paises = this.api.ObtienePaises().pipe(first());
    const activado = true; //this.api.ObtieneServidorActivado().pipe(first());
    const fp = this.api.ObtieneServidorFingerprint().pipe(first());
    
    forkJoin([paises, activado, fp]).subscribe(resultados => {
      this.paises = resultados [0];
      this.Activado.emit(resultados[1]);
      if(!resultados[1]) {
        this.propsForm.get("FingerPrint").setValue(resultados[2]);
        this.CodigoActivacion.emit(resultados[2]);
      }
    }, ( error) => { this.CodigoActivacion.emit(true) } );

    this.api.ObtieneAccessoServidorRegistro().pipe(first())
    .subscribe(status => {
      this.AccesoServidorRegistro.emit(status);
      this.accesoRegistro = status;
      this.cdr.detectChanges();
    }, (err)=> { console.error(err); this.activarConClave = true; this.cdr.detectChanges()} );
    

  }

  public onActivar() {}
}
