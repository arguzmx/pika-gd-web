import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MetadataJerarquiaComponent } from './metadata-jerarquia.component';

describe('MetadataJerarquiaComponent', () => {
  let component: MetadataJerarquiaComponent;
  let fixture: ComponentFixture<MetadataJerarquiaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MetadataJerarquiaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MetadataJerarquiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
