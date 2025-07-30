import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ListActivities4classComponent } from './list-activities4class.component';

describe('ListActivities4classComponent', () => {
  let component: ListActivities4classComponent;
  let fixture: ComponentFixture<ListActivities4classComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ListActivities4classComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ListActivities4classComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
