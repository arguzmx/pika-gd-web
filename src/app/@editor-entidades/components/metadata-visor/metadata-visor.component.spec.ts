import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MetadataVisorComponent } from './metadata-visor.component';

describe('MetadataVisorComponent', () => {
  let component: MetadataVisorComponent;
  let fixture: ComponentFixture<MetadataVisorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MetadataVisorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MetadataVisorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
