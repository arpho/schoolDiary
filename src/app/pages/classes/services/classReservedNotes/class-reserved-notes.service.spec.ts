import { TestBed } from '@angular/core/testing';

import { ClassReservedNotesService } from './class-reserved-notes.service';
import { Firestore } from '@angular/fire/firestore';

describe('ClassReservedNotesService', () => {
  let service: ClassReservedNotesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Firestore, useValue: {} }
      ]
    });
    service = TestBed.inject(ClassReservedNotesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
