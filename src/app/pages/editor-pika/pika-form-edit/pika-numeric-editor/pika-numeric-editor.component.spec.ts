import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PikaNumericEditorComponent } from './pika-numeric-editor.component';

describe('PikaNumericEditorComponent', () => {
  let component: PikaNumericEditorComponent;
  let fixture: ComponentFixture<PikaNumericEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PikaNumericEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PikaNumericEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
