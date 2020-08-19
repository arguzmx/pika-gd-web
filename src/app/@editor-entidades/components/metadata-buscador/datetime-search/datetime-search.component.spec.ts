import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DatetimeSearchComponent } from './datetime-search.component';


describe('DatetimeSearchComponent', () => {
  let component: DatetimeSearchComponent;
  let fixture: ComponentFixture<DatetimeSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatetimeSearchComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatetimeSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
