import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalScannerComponent } from './modal-scanner.component';

describe('ModalScannerComponent', () => {
  let component: ModalScannerComponent;
  let fixture: ComponentFixture<ModalScannerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalScannerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalScannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
