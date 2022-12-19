import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NbCardComponent } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';
import { first } from 'rxjs/operators';
import { Traductor } from '../../../@editor-entidades/editor-entidades.module';
import { ModuloAplicacion } from '../../../@pika/seguridad';
import { EventoAuditoriaActivo } from '../../../@pika/seguridad/evento-auditoria-activo';
import { TipoEventoAuditoria } from '../../../@pika/seguridad/tipo-evento-auditoria';
import { BitacoraService } from '../../services/bitacora.service';

@Component({
  selector: 'ngx-eventos-config-modulo',
  templateUrl: './eventos-config-modulo.component.html',
  styleUrls: ['./eventos-config-modulo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventosConfigModuloComponent implements OnInit {
  @Input() modulos: ModuloAplicacion[] = [];
  modulosLocales: ModuloAplicacion[] = [];
  @ViewChildren(NbCardComponent) cards: QueryList<NbCardComponent>;
  isDisabled: boolean = false;
  public T: Traductor;
  constructor(private bitacoraService: BitacoraService,
    private cdr: ChangeDetectorRef,
    ts: TranslateService) { 
      this.T = new Traductor(ts);
    }
  
  cambios: string[] =[];
  formEventos : FormGroup;

  ngOnInit(): void {
    if(this.modulos) {
      this.T.ts = [];
      this.modulos.forEach(m => {
        m.EventosAuditables.forEach(e => {
          e.Descripcion = `auditoria.eventos.${e.Descripcion}`;
          this.T.ts.push(e.Descripcion);
        });
      });
  
      this.T.ObtenerTraduccion(this.T.ts).pipe(first()).subscribe(p=> {
        this.modulos.forEach(m => {
          m.EventosAuditables.forEach(e => {
            e.Descripcion = p[e.Descripcion];
          });
        });
        this.CreaForma();
      });
    }
  }

  CreaForma() {
    this.formEventos = new FormGroup({});
    this.modulos.forEach(m=> {
        m.EventosAuditables.forEach(e=> {
          this.formEventos.addControl(e.Id, new FormControl())
        }); 
    });

    this.modulos.forEach(m=> {
      m.EventosAuditables.forEach(e=> {
        this.formEventos.get(e.Id).setValue(e.Activo);
      }); 
    });
    this.modulosLocales = this.modulos;
  }

  
  checkedChange($event: boolean, Id: string ) {
    const ev = this.ToEventoActivo(Id, $event);
    if (ev) {
      this.EmitirCambios([ev]);
    }  
  }

  EmitirCambios(eventos: EventoAuditoriaActivo[] ) {
    this.disableView();
    this.bitacoraService.ActualizarAuditables(eventos).pipe(first()).subscribe(x=> {
      this.enableView();
    }, () => {
      this.enableView();
    });
  }

  disableView() {
    this.cards.forEach(c=> {c.accent = 'danger'; });
    this.isDisabled = true;
    this.cdr.detectChanges();
  }

  enableView() {
    this.cards.forEach(c=> {c.accent = 'info'; });
    this.isDisabled = false;
    this.cdr.detectChanges();
  }


  ToEventoActivo(Id: string, activo: boolean) {
    var item: TipoEventoAuditoria = null;
    this.modulos.forEach(m=> {
      const tmp = m.EventosAuditables.find(e=>e.Id == Id);
      if (tmp) {
        item = {... tmp};
      }
    });

    if (item) {
      return {
        Id: Id,
        DominioId: "-",
        UAId: "-",
        AppId: item.AppId,
        ModuloId: item.ModuloId,
        TipoEntidad: item.TipoEntidad,
        TipoEvento: item.TipoEvento,
        Auditar: activo
      }
    }

    return null;
  }


  SetCheckboxes(modId: string, valor: boolean) {
    const m = this.modulos.find(x=>x.Id == modId);
    const eventos: EventoAuditoriaActivo[] = [];
    if (m){
      m.EventosAuditables.forEach(e=> {
        this.formEventos.get(e.Id).setValue(valor);
        eventos.push(this.ToEventoActivo(e.Id, valor));
      }); 
    }

    if(eventos.length > 0){
     this.EmitirCambios(eventos);
    }
  }



}
