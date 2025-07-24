import { TestBed } from '@angular/core/testing';

import { ClassReservedNotesService } from './class-reserved-notes.service';

describe('ClassReservedNotesService', () => {
  let service: ClassReservedNotesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClassReservedNotesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
