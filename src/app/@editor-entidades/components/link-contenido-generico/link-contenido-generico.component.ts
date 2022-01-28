import { PermisoPuntoMontaje } from './../../../@pika/conteido/permiso-punto-montaje';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from './../../../app-config';
import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NbDialogRef } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';
import { PikaApiService } from '../../../@pika/pika-api';
import { Traductor } from '../../editor-entidades.module';
import { SesionQuery } from '../../../@pika/state';
import { AsyncSubject, Observable } from 'rxjs';
import { ContenidoVinculado } from '../../../@pika/conteido/contenido-vinculado';
import { first } from 'rxjs/operators';
import { AppLogService } from '../../../@pika/servicios';

@Component({
  selector: 'ngx-link-contenido-generico',
  templateUrl: './link-contenido-generico.component.html',
  styleUrls: ['./link-contenido-generico.component.scss'],
})
export class LinkContenidoGenericoComponent implements OnInit {

  @Input() id: string;
  @Input() tipo: string;

  public loading: boolean = true;
  public valido: boolean = false;
  public permisoCrear: boolean = false;
  public existente: boolean = false;
  public nombre: string = '';
  private elemento: any = null;
  public T: Traductor;

  public cliente: PikaApiService<any, string>;


  constructor(
    ts: TranslateService,
    app: AppConfig,
    sesion: SesionQuery,
    http: HttpClient,
    private applog: AppLogService,
    protected ref: NbDialogRef<LinkContenidoGenericoComponent>,
  ) {
    this.T = new Traductor(ts);
    this.cliente = new PikaApiService(app, sesion, http);


  }

  ngOnInit(): void {
    this.CargaTraducciones();
    this.ParamListener();
  }

  private CargaTraducciones() {
    this.T.ts = [
      'link-contenido.titulo',
      'link-contenido.errorconfiguracion',
      'link-contenido.sincontenido',
      'link-contenido.sinpermiso',
      'ui.cancelar',
      'ui.crear'
    ];
    this.T.ObtenerTraducciones();
  }


  public ParamListener(): void {
    this.ObtieneElementoContenido(this.tipo, this.id).pipe(first())
      .subscribe(el => {
        // Esta llamada siemrpe devuelve el elemento y es  configurada en el controlador del tipo de elemento
        this.nombre = el.Nombre;
        if (el.Id == null) {
          // Si el Id es nulo no tiene contenido vinculado
          if (el.PuntoMontajeId == null || el.VolumenId == null) {
            this.valido = false;
            this.loading = false;
            this.existente = false;
          } else {
            this.VerificaAccesoRepositorio(el.PuntoMontajeId).pipe(first())
            .subscribe(p => {
              this.permisoCrear = p.Crear;
              this.elemento = el;
              this.loading = false;
              this.valido = true;  
            }, (e)=>{ this.loading = false; });
          }
        } else {
          // Si tiene contenido vinculado
          this.valido = true;  
          this.existente = true;
          this.ObtieneElemento(el.Id);
        }
      }, (e) => { this.loading = false });
  }

  private ObtieneElemento(id: string) {
    this.cliente.Get(id, 'Elemento').pipe(first())
      .subscribe(el => {
        this.VerificaAccesoRepositorio(el.PuntoMontajeId).pipe(first())
        .subscribe(p => {
          if(p.Leer) {
            this.ref.close(el);
          } else {
            this.loading = false;  
          }
        }, (e)=>{ this.ref.close(null); });
      }, (e) => { this.ref.close(null); });
  }

  public VerificaAccesoRepositorio(id: string): Observable<PermisoPuntoMontaje> {
    return this.cliente.ObtienePermisoPuntoMontaje(id);
  }

  public ObtieneElementoContenido(tipo: string, id: string): Observable<ContenidoVinculado> {
    return this.cliente.GetContenidoVinculado(tipo, id);
  }

  public VinculaElmentoContenido(tipo: string, id: string, contenidoId: string): Observable<any> {
    return this.cliente.VinculaElmentoContenido(tipo, id, contenidoId);
  }

  public CreaCarpeta(entidad: string, PuntoMontajeId: string, ruta): Observable<any> {
    return this.cliente.CreaCarpeta(entidad, PuntoMontajeId, ruta);
  }

  public crear(): void {
    this.loading = true;

    this.CreaCarpeta('Carpeta', this.elemento.PuntoMontajeId, this.elemento.RutaRepositorio)
      .pipe(first()).subscribe(c => {
        this.elemento.CarpetaId = c['Id'];
        this.elemento["AutoNombrar"] = true;
        this.cliente.Post( this.elemento, 'Elemento').pipe(
          first()).subscribe(r => {
            if (r) {
              this.VinculaElmentoContenido(this.tipo, this.id, r['Id']).pipe(first())
                .subscribe(link => {
                  this.ref.close(r);
                  this.loading = false;
                }, () => { this.loading = false; });
            }
          }, (error) => { }, () => { });

      }, (e) => { this.loading = false });

  }


  cancel() {
    this.ref.close(null);
  }

}
