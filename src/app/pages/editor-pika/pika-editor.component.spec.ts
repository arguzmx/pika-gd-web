import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PikaEditorComponent } from './pika-editor.component';

describe('PikaEditorComponent', () => {
  let component: PikaEditorComponent;
  let fixture: ComponentFixture<PikaEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PikaEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PikaEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
