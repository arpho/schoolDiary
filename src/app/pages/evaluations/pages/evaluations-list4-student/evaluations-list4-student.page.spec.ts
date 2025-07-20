import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EvaluationsList4StudentPage } from './evaluations-list4-student.page';

describe('EvaluationsList4StudentPage', () => {
  let component: EvaluationsList4StudentPage;
  let fixture: ComponentFixture<EvaluationsList4StudentPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EvaluationsList4StudentPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
