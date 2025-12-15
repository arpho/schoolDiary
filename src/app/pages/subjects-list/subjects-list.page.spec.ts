import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubjectsListPage } from './subjects-list.page';

describe('SubjectsListPage', () => {
  let component: SubjectsListPage;
  let fixture: ComponentFixture<SubjectsListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SubjectsListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
