import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MetadataTablaComponent } from './metadata-tabla.component';

describe('MetadataTablaComponent', () => {
  let component: MetadataTablaComponent;
  let fixture: ComponentFixture<MetadataTablaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MetadataTablaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MetadataTablaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
