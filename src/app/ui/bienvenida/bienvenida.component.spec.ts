import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BienvenidaComponent } from './bienvenida.component';

describe('BienvenidaComponent', () => {
  let component: BienvenidaComponent;
  let fixture: ComponentFixture<BienvenidaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BienvenidaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BienvenidaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
