import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PilaFieldStringComponent } from './pila-field-string.component';

describe('PilaFieldStringComponent', () => {
  let component: PilaFieldStringComponent;
  let fixture: ComponentFixture<PilaFieldStringComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PilaFieldStringComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PilaFieldStringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
