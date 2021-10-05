import { Documento } from './../../model/documento';
import { EventoAplicacion } from './../../../@pika/eventos/evento-aplicacion';
import { AppEventBus } from './../../../@pika/state/app-event-bus';
import { Component, ComponentFactoryResolver, ComponentRef, OnInit, ViewChild, ViewContainerRef, AfterViewInit, OnChanges, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { NbTabsetComponent } from '@nebular/theme';
import { IUploadConfig } from '../../model/i-upload-config';

@Component({
  selector: 'ngx-visor-favoritos',
  templateUrl: './visor-favoritos.component.html',
  styleUrls: ['./visor-favoritos.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisorFavoritosComponent implements OnInit, AfterViewInit {

  private currentId: string;
  public elementos: IUploadConfig[] = [];
  @ViewChild('tabsetelementos') tabsetelementos: NbTabsetComponent;

  constructor(
    private cdr: ChangeDetectorRef,
    private appEventBus: AppEventBus
    ) { }

  ngAfterViewInit(): void {
    this.tabsetelementos.tabs.changes.subscribe(c=>{
      this.TabActivo();
    });
  }


  private TabActivo() {
    if (this.tabsetelementos.tabs.length>0) {
      this.tabsetelementos.tabs.forEach(t=>{
        t.active = false;
      })
      var tab = this.tabsetelementos.tabs.find(x=>x.tabId == this.currentId);
      if (tab) {
        tab.active = true;
      } else {
        this.tabsetelementos.tabs.last.active = true;
      }
    }
    this.cdr.detectChanges();
  }

  ngOnInit(): void {
    this.appEventBus.LeeEventos().subscribe(ev=> {
      this.ProcesaElementos(ev);
    });
  }

  private ProcesaElementos(ev: EventoAplicacion): void {
    this.currentId = ev.id;
    var added = false;
    this.appEventBus.elementosContenido.forEach(e => {
      if (this.elementos.findIndex(c=>c.ElementoId == e.id)<0){
        this.CreaTab(e);
        added = true;
      } 
    });

    if (!added) {
      this.TabActivo();
    }
  }

  private CreaTab(e: EventoAplicacion): void {
    const c:  IUploadConfig = {
      Nombre: e.payload.find(x=>x.id == "Nombre").valor,
      ElementoId: e.payload.find(x=>x.id == "Id").valor,
      VolumenId: e.payload.find(x=>x.id == "VolumenId").valor,
      PuntoMontajeId: e.payload.find(x=>x.id == "PuntoMontajeId").valor,
      CarpetaId: e.payload.find(x=>x.id == "CarpetaId").valor,
      TransactionId: e.payload.find(x=>x.id == "Id").valor,
      VersionId: e.payload.find(x=>x.id == "VersionId").valor,
      parametros: e.payload
    }
    this.elementos.push(c);
    this.cdr.detectChanges();
  }

  

  evCerrarDocumento($event:Documento) {
    const index = this.elementos.findIndex(x=>x.ElementoId == $event.Id);
    if(index > -1){
       this.elementos.splice(index,1);
    }
    this.appEventBus.EliminaElementoContenido($event.Id);
    
    if (this.elementos.length == 0)  this.evCerrarVista();
    this.cdr.detectChanges();

  }

  evCerrarVista() {
    this.appEventBus.EmitirCerrarPlugins();
  }

}
