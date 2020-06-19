import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PikaFormEditComponent } from './pika-form-edit.component';

describe('PikaFormEditComponent', () => {
  let component: PikaFormEditComponent;
  let fixture: ComponentFixture<PikaFormEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PikaFormEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PikaFormEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
