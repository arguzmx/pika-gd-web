import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PermisosHostComponent } from './permisos-host.component';

describe('PermisosHostComponent', () => {
  let component: PermisosHostComponent;
  let fixture: ComponentFixture<PermisosHostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PermisosHostComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PermisosHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
