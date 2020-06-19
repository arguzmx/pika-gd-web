import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PikaBoolEditorComponent } from './pika-bool-editor.component';

describe('PikaBoolEditorComponent', () => {
  let component: PikaBoolEditorComponent;
  let fixture: ComponentFixture<PikaBoolEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PikaBoolEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PikaBoolEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
