import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivitiesListPage } from './activities-list.page';

describe('ActivitiesListPage', () => {
  let component: ActivitiesListPage;
  let fixture: ComponentFixture<ActivitiesListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivitiesListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
