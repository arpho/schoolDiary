import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditSubjectPage } from './edit-subject.page';

describe('EditSubjectPage', () => {
  let component: EditSubjectPage;
  let fixture: ComponentFixture<EditSubjectPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EditSubjectPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
