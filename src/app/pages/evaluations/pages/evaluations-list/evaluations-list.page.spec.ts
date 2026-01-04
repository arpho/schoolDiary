import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { EvaluationsListPage } from './evaluations-list.page';
import { EvaluationService } from '../../services/evaluation/evaluation.service';
import { of } from 'rxjs';

describe('EvaluationsListPage', () => {
  let component: EvaluationsListPage;
  let fixture: ComponentFixture<EvaluationsListPage>;
  let evaluationServiceMock: any;

  beforeEach(waitForAsync(() => {
    evaluationServiceMock = {
      getEvaluations: jasmine.createSpy('getEvaluations').and.returnValue(of([]))
    };

    TestBed.configureTestingModule({
      imports: [EvaluationsListPage],
      providers: [
        { provide: EvaluationService, useValue: evaluationServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EvaluationsListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
