import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorPlantillaComponent } from './editor-plantilla.component';

describe('EditorPlantillaComponent', () => {
  let component: EditorPlantillaComponent;
  let fixture: ComponentFixture<EditorPlantillaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditorPlantillaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditorPlantillaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
