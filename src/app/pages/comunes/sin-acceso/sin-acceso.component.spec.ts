import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SinAccesoComponent } from './sin-acceso.component';

describe('SinAccesoComponent', () => {
  let component: SinAccesoComponent;
  let fixture: ComponentFixture<SinAccesoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SinAccesoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SinAccesoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
