import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PikaDatetimeEditorComponent } from './pika-datetime-editor.component';

describe('PikaDatetimeEditorComponent', () => {
  let component: PikaDatetimeEditorComponent;
  let fixture: ComponentFixture<PikaDatetimeEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PikaDatetimeEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PikaDatetimeEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
