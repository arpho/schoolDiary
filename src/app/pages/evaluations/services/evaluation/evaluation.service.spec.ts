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
});
