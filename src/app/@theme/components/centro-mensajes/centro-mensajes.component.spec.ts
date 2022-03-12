import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CentroMensajesComponent } from './centro-mensajes.component';

describe('CentroMensajesComponent', () => {
  let component: CentroMensajesComponent;
  let fixture: ComponentFixture<CentroMensajesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CentroMensajesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CentroMensajesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
