import { TestBed } from '@angular/core/testing';

import { ReservedNotes4studentsService } from './reserved-notes4students.service';
import { Firestore } from '@angular/fire/firestore';

describe('ReservedNotes4studentsService', () => {
  let service: ReservedNotes4studentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ReservedNotes4studentsService,
        { provide: Firestore, useValue: {} }
      ]
    });
    service = TestBed.inject(ReservedNotes4studentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
