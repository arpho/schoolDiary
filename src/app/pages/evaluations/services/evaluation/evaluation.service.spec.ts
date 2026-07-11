import { TestBed } from '@angular/core/testing';
import { EvaluationService } from './evaluation.service';
import { Firestore } from '@angular/fire/firestore';
import { ToastController } from '@ionic/angular/standalone';

describe('EvaluationService', () => {
  let service: EvaluationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EvaluationService,
        { provide: Firestore, useValue: {} },
        { 
          provide: ToastController, 
          useValue: { 
            create: jasmine.createSpy('create').and.returnValue(Promise.resolve({
              present: jasmine.createSpy('present').and.returnValue(Promise.resolve())
            }))
          } 
        }
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

      // Spy on doc and getDoc to prevent actual Firestore calls
      spyOn<any>(service, 'docFn').and.returnValue({});
      spyOn<any>(service, 'getDocFn').and.returnValue(Promise.resolve({
        exists: () => false,
        data: () => ({})
      }));

      // Spy on Promise.race to resolve immediately and prevent Worker creation in tests
      spyOn(Promise, 'race').and.returnValue(Promise.resolve('mock-base64'));

      try {
        await service.generatePdf(evaluationKey);
      } catch (e) {
        // Ignored
      }

      expect(fetchSpy).toHaveBeenCalledWith(evaluationKey);
    });
  });
});
