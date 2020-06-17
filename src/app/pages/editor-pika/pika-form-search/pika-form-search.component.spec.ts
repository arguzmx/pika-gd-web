import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PikaFormSearchComponent } from './pika-form-search.component';

describe('PikaFormSearchComponent', () => {
  let component: PikaFormSearchComponent;
  let fixture: ComponentFixture<PikaFormSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PikaFormSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PikaFormSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
