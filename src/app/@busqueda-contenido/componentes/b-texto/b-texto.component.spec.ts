import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BTextoComponent } from './b-texto.component';

describe('BTextoComponent', () => {
  let component: BTextoComponent;
  let fixture: ComponentFixture<BTextoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BTextoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BTextoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
