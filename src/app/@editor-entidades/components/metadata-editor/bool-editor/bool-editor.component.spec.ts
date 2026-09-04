import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BoolEditorComponent } from './bool-editor.component';

describe('PikaBoolEditorComponent', () => {
  let component: BoolEditorComponent;
  let fixture: ComponentFixture<BoolEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BoolEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoolEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
