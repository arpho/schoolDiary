import { TestBed } from '@angular/core/testing';

import { ReservedNotes4studentsService } from './reserved-notes4students.service';

describe('ReservedNotes4studentsService', () => {
  let service: ReservedNotes4studentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReservedNotes4studentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
