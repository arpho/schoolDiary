import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MyDatePickerComponent } from './my-date-picker.component';

describe('MyDatePickerComponent', () => {
  let component: MyDatePickerComponent;
  let fixture: ComponentFixture<MyDatePickerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MyDatePickerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MyDatePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
