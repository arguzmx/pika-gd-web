import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoDeclinarActivoTxComponent } from './dialogo-declinar-activo-tx.component';

describe('DialogoDeclinarActivoTxComponent', () => {
  let component: DialogoDeclinarActivoTxComponent;
  let fixture: ComponentFixture<DialogoDeclinarActivoTxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogoDeclinarActivoTxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogoDeclinarActivoTxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
