import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PikaTableComponent } from './pika-table.component';

describe('PikaTableComponent', () => {
  let component: PikaTableComponent;
  let fixture: ComponentFixture<PikaTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PikaTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PikaTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
