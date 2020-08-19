import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MetadataBuscadorComponent } from './metadata-buscador.component';

describe('MetadataBuscadorComponent', () => {
  let component: MetadataBuscadorComponent;
  let fixture: ComponentFixture<MetadataBuscadorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MetadataBuscadorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MetadataBuscadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
