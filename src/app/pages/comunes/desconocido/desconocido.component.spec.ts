import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DesconocidoComponent } from './desconocido.component';

describe('DesconocidoComponent', () => {
  let component: DesconocidoComponent;
  let fixture: ComponentFixture<DesconocidoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DesconocidoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DesconocidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
