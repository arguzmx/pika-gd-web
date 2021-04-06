import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HostBusquedaContenidoComponent } from './host-busqueda-contenido.component';

describe('HostBusquedaContenidoComponent', () => {
  let component: HostBusquedaContenidoComponent;
  let fixture: ComponentFixture<HostBusquedaContenidoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HostBusquedaContenidoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HostBusquedaContenidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
