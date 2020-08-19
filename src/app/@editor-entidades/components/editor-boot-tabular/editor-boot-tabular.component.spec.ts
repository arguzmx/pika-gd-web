import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorBootTabularComponent } from './editor-boot-tabular.component';

describe('EditorBootTabularComponent', () => {
  let component: EditorBootTabularComponent;
  let fixture: ComponentFixture<EditorBootTabularComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditorBootTabularComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditorBootTabularComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
