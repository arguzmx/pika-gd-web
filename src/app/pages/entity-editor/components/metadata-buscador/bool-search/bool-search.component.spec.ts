import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BoolSearchComponent } from './bool-search.component';

describe('BoolSearchComponent', () => {
  let component: BoolSearchComponent;
  let fixture: ComponentFixture<BoolSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BoolSearchComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoolSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
