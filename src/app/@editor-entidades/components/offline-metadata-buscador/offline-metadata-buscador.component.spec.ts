import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OfflineMetadataBuscadorComponent } from './offline-metadata-buscador.component';

describe('OfflineMetadataBuscadorComponent', () => {
  let component: OfflineMetadataBuscadorComponent;
  let fixture: ComponentFixture<OfflineMetadataBuscadorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OfflineMetadataBuscadorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OfflineMetadataBuscadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
