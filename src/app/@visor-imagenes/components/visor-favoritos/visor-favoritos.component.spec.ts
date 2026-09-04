import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VisorFavoritosComponent } from './visor-favoritos.component';

describe('VisorFavoritosComponent', () => {
  let component: VisorFavoritosComponent;
  let fixture: ComponentFixture<VisorFavoritosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VisorFavoritosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VisorFavoritosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
