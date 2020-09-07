import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PermisosModuloComponent } from './permisos-modulo.component';

describe('PermisosModuloComponent', () => {
  let component: PermisosModuloComponent;
  let fixture: ComponentFixture<PermisosModuloComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PermisosModuloComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PermisosModuloComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
