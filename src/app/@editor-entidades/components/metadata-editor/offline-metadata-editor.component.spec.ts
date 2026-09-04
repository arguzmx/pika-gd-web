import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OfflineMetadataEditorComponent } from './offline-metadata-editor.component';

describe('OfflineMetadataEditorComponent', () => {
  let component: OfflineMetadataEditorComponent;
  let fixture: ComponentFixture<OfflineMetadataEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OfflineMetadataEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OfflineMetadataEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
