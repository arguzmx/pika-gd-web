import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VisorVideoComponent } from './visor-video.component';

describe('VisorVideoComponent', () => {
  let component: VisorVideoComponent;
  let fixture: ComponentFixture<VisorVideoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VisorVideoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VisorVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
