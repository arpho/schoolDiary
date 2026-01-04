import { TestBed } from '@angular/core/testing';
import { SubjectService } from '../subjects/subject.service';
import { Firestore } from '@angular/fire/firestore';

describe('SubjectService', () => {
  let service: SubjectService;

  beforeEach(() => {
    const firestoreMock = {}; 
    TestBed.configureTestingModule({
      providers: [
        { provide: Firestore, useValue: firestoreMock }
      ]
    });
    service = TestBed.inject(SubjectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
