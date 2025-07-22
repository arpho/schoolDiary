import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EvaluationsListPage } from './evaluations-list.page';

describe('EvaluationsListPage', () => {
  let component: EvaluationsListPage;
  let fixture: ComponentFixture<EvaluationsListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EvaluationsListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
