import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EvaluationDialogPage } from './evaluation-dialog.page';

describe('EvaluationDialogPage', () => {
  let component: EvaluationDialogPage;
  let fixture: ComponentFixture<EvaluationDialogPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EvaluationDialogPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
