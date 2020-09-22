import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HostVisorContenidoComponent } from './host-visor-contenido.component';

describe('HostVisorContenidoComponent', () => {
  let component: HostVisorContenidoComponent;
  let fixture: ComponentFixture<HostVisorContenidoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HostVisorContenidoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HostVisorContenidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
