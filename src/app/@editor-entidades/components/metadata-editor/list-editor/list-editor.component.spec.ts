import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PikaListEditorComponent } from './pika-list-editor.component';

describe('PikaListEditorComponent', () => {
  let component: PikaListEditorComponent;
  let fixture: ComponentFixture<PikaListEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PikaListEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PikaListEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
