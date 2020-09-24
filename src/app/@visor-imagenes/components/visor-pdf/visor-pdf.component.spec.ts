import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VisorPdfComponent } from './visor-pdf.component';

describe('VisorPdfComponent', () => {
  let component: VisorPdfComponent;
  let fixture: ComponentFixture<VisorPdfComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VisorPdfComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VisorPdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
