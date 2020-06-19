import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PikaStringEditorComponent } from './pika-string-editor.component';

describe('PikaStringEditorComponent', () => {
  let component: PikaStringEditorComponent;
  let fixture: ComponentFixture<PikaStringEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PikaStringEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PikaStringEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
