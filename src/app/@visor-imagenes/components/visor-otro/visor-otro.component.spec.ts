import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VisorOtroComponent } from './visor-otro.component';

describe('VisorOtroComponent', () => {
  let component: VisorOtroComponent;
  let fixture: ComponentFixture<VisorOtroComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VisorOtroComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VisorOtroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
