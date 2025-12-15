import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateSubjectPage } from './create-subject.page';

describe('CreateSubjectPage', () => {
  let component: CreateSubjectPage;
  let fixture: ComponentFixture<CreateSubjectPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateSubjectPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
