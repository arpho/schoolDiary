import { TestBed } from '@angular/core/testing';
import { EvaluationService } from './evaluation.service';
import { Firestore } from '@angular/fire/firestore';

describe('EvaluationService', () => {
  let service: EvaluationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EvaluationService,
        { provide: Firestore, useValue: {} }
      ]
    });
    service = TestBed.inject(EvaluationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('generatePdf', () => {
    it('should call fetchEvaluation with correct key', async () => {
      const evaluationKey = 'test-key';
      const fetchSpy = spyOn(service, 'fetchEvaluation').and.returnValue(Promise.resolve({
        description: 'Test',
        note: 'Some note',
        grid: { indicatori: [] },
        studentKey: 's1',
        classKey: 'c1',
        teacherKey: 't1',
        data: '2025-01-01'
      } as any));

      // Mock the Firestore logic or other dependencies if needed, 
      // but here we just want to see if the first step is correct.
      // Since generatePdf is complex, we might just verify the initial call.
      
      try {
        await service.generatePdf(evaluationKey);
      } catch (e) {
        // Expected to fail eventually because Worker is not mocked, 
        // but fetchEvaluation should have been called.
      }

      expect(fetchSpy).toHaveBeenCalledWith(evaluationKey);
    });
  });
});
