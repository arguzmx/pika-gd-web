import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogMetadataComponent } from './dialog-metadata.component';

describe('DialogMetadataComponent', () => {
  let component: DialogMetadataComponent;
  let fixture: ComponentFixture<DialogMetadataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogMetadataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogMetadataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
