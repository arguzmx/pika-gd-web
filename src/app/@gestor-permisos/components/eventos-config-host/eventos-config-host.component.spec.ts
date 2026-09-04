import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventosConfigHostComponent } from './eventos-config-host.component';

describe('EventosConfigHostComponent', () => {
  let component: EventosConfigHostComponent;
  let fixture: ComponentFixture<EventosConfigHostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventosConfigHostComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventosConfigHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
