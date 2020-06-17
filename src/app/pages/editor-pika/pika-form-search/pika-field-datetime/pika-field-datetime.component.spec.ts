import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PikaFieldDatetimeComponent } from './pika-field-datetime.component';

describe('PikaFieldDatetimeComponent', () => {
  let component: PikaFieldDatetimeComponent;
  let fixture: ComponentFixture<PikaFieldDatetimeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PikaFieldDatetimeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PikaFieldDatetimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
