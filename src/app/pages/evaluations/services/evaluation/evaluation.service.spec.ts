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

  describe('Database Operations (CRUD)', () => {
    beforeEach(() => {
      // Mock internal Firestore wrapper methods to prevent actual DB calls
      spyOn<any>(service, 'docFn').and.returnValue('mock-doc-ref');
      spyOn<any>(service, 'collectionFn').and.returnValue('mock-collection-ref');
    });

    it('READ: should fetch an evaluation using getDoc (fetchEvaluation)', async () => {
      const mockEvalData = { description: 'Good job' };
      const getDocSpy = spyOn<any>(service, 'getDocFn').and.returnValue(Promise.resolve({
        exists: () => true,
        id: 'test-eval-id',
        data: () => mockEvalData
      }));

      const evaluation = await service.fetchEvaluation('test-eval-id');
      
      expect((service as any)['docFn']).toHaveBeenCalledWith(jasmine.anything(), 'valutazioni', 'test-eval-id');
      expect(getDocSpy).toHaveBeenCalledWith('mock-doc-ref' as any);
      expect(evaluation).toBeTruthy();
      expect(evaluation.key).toBe('test-eval-id');
      expect(evaluation.description).toBe('Good job');
    });

    it('WRITE: should add a new evaluation using addDoc (addEvaluation)', async () => {
      const addDocSpy = spyOn<any>(service, 'addDocFn').and.returnValue(Promise.resolve({ id: 'new-eval-id' }));

      // Mock updateLocalCache to avoid errors
      spyOn<any>(service, 'updateLocalCache').and.callFake(() => {});

      const newEval = { serialize: () => ({ description: 'Great work' }) } as any;
      newEval.setKey = jasmine.createSpy('setKey');

      await service.addEvaluation(newEval);

      expect((service as any)['collectionFn']).toHaveBeenCalledWith(jasmine.anything(), 'valutazioni');
      expect(addDocSpy).toHaveBeenCalledWith('mock-collection-ref' as any, jasmine.objectContaining({ description: 'Great work' }));
      expect(newEval.setKey).toHaveBeenCalledWith('new-eval-id');
      expect((service as any)['updateLocalCache']).toHaveBeenCalled();
    });

    it('UPDATE: should update an evaluation using setDoc (updateEvaluation)', async () => {
      const setDocSpy = spyOn<any>(service, 'setDocFn').and.returnValue(Promise.resolve());
      spyOn<any>(service, 'updateLocalCache').and.callFake(() => {});

      const updatedEval = { key: 'test-update-id', serialize: () => ({ description: 'Excellent' }) } as any;
      
      await service.updateEvaluation(updatedEval);

      expect((service as any)['docFn']).toHaveBeenCalledWith(jasmine.anything(), 'valutazioni', 'test-update-id');
      expect(setDocSpy).toHaveBeenCalledWith('mock-doc-ref' as any, jasmine.objectContaining({ description: 'Excellent' }));
      expect((service as any)['updateLocalCache']).toHaveBeenCalled();
    });

    it('DELETE: should delete an evaluation using deleteDoc (deleteEvaluation)', async () => {
      const deleteDocSpy = spyOn<any>(service, 'deleteDocFn').and.returnValue(Promise.resolve());
      spyOn<any>(service, 'invalidateCache').and.callFake(() => {});
      
      const evalToDelete = { key: 'test-delete-id' } as any;

      await service.deleteEvaluation(evalToDelete);

      expect((service as any)['docFn']).toHaveBeenCalledWith(jasmine.anything(), 'valutazioni', 'test-delete-id');
      expect(deleteDocSpy).toHaveBeenCalledWith('mock-doc-ref' as any);
      expect((service as any)['invalidateCache']).toHaveBeenCalled();
    });
  });
});
