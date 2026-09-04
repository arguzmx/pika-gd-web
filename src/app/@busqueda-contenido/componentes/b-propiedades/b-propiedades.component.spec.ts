import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BPropiedadesComponent } from './b-propiedades.component';

describe('BPropiedadesComponent', () => {
  let component: BPropiedadesComponent;
  let fixture: ComponentFixture<BPropiedadesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BPropiedadesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BPropiedadesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
