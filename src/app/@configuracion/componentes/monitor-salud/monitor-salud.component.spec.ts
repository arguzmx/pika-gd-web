import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitorSaludComponent } from './monitor-salud.component';

describe('MonitorSaludComponent', () => {
  let component: MonitorSaludComponent;
  let fixture: ComponentFixture<MonitorSaludComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MonitorSaludComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonitorSaludComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
