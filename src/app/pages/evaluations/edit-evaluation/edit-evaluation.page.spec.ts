import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditEvaluationPage } from './edit-evaluation.page';

describe('EditEvaluationPage', () => {
  let component: EditEvaluationPage;
  let fixture: ComponentFixture<EditEvaluationPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EditEvaluationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
