import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OfflineMetadataVisorComponent } from './offline-metadata-visor.component';

describe('OfflineMetadataVisorComponent', () => {
  let component: OfflineMetadataVisorComponent;
  let fixture: ComponentFixture<OfflineMetadataVisorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OfflineMetadataVisorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OfflineMetadataVisorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
