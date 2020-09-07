import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PermisosAplicacionComponent } from './permisos-aplicacion.component';

describe('PermisosAplicacionComponent', () => {
  let component: PermisosAplicacionComponent;
  let fixture: ComponentFixture<PermisosAplicacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PermisosAplicacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PermisosAplicacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
