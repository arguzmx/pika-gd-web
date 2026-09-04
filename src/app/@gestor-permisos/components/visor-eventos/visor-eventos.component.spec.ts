import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VisorEventosComponent } from './visor-eventos.component';

describe('VisorEventosComponent', () => {
  let component: VisorEventosComponent;
  let fixture: ComponentFixture<VisorEventosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VisorEventosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VisorEventosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
