import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HostBusquedaComponent } from './host-busqueda.component';

describe('HostBusquedaComponent', () => {
  let component: HostBusquedaComponent;
  let fixture: ComponentFixture<HostBusquedaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HostBusquedaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HostBusquedaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
