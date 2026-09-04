import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BCarpetaComponent } from './b-carpeta.component';

describe('BCarpetaComponent', () => {
  let component: BCarpetaComponent;
  let fixture: ComponentFixture<BCarpetaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BCarpetaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BCarpetaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
