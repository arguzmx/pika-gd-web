import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BMetadatosComponent } from './b-metadatos.component';

describe('BMetadatosComponent', () => {
  let component: BMetadatosComponent;
  let fixture: ComponentFixture<BMetadatosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BMetadatosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BMetadatosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
