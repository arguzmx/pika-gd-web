import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CargaInventarioComponent } from './carga-inventario.component';

describe('CargaInventarioComponent', () => {
  let component: CargaInventarioComponent;
  let fixture: ComponentFixture<CargaInventarioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CargaInventarioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CargaInventarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
