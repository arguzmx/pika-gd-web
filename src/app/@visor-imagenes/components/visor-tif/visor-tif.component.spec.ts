import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VisorTifComponent } from './visor-tif.component';

describe('VisorTifComponent', () => {
  let component: VisorTifComponent;
  let fixture: ComponentFixture<VisorTifComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VisorTifComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VisorTifComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
