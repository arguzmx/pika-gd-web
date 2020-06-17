import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PikaFieldListComponent } from './pika-field-list.component';

describe('PikaFieldBoolComponent', () => {
  let component: PikaFieldListComponent;
  let fixture: ComponentFixture<PikaFieldListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PikaFieldListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PikaFieldListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
