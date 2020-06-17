import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PikaFieldNumericComponent } from './pika-field-numeric.component';

describe('PikaFieldNumericComponent', () => {
  let component: PikaFieldNumericComponent;
  let fixture: ComponentFixture<PikaFieldNumericComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PikaFieldNumericComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PikaFieldNumericComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
