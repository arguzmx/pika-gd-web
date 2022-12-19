import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventosConfigAplicacionComponent } from './eventos-config-aplicacion.component';

describe('EventosConfigAplicacionComponent', () => {
  let component: EventosConfigAplicacionComponent;
  let fixture: ComponentFixture<EventosConfigAplicacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventosConfigAplicacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventosConfigAplicacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
