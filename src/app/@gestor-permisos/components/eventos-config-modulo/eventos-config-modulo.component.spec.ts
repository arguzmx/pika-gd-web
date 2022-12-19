import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventosConfigModuloComponent } from './eventos-config-modulo.component';

describe('EventosConfigModuloComponent', () => {
  let component: EventosConfigModuloComponent;
  let fixture: ComponentFixture<EventosConfigModuloComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventosConfigModuloComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventosConfigModuloComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
