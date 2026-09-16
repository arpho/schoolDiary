import { TestBed } from '@angular/core/testing';
import { StudentPhotoService } from './student-photo.service';
import { Storage } from '@angular/fire/storage';

describe('StudentPhotoService (Storage Operations)', () => {
  let service: StudentPhotoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        StudentPhotoService,
        { provide: Storage, useValue: {} }
      ]
    });
    service = TestBed.inject(StudentPhotoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
