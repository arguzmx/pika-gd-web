import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PikaFieldBoolComponent } from './pika-field-bool.component';

describe('PikaFieldBoolComponent', () => {
  let component: PikaFieldBoolComponent;
  let fixture: ComponentFixture<PikaFieldBoolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PikaFieldBoolComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PikaFieldBoolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
