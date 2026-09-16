import { TestBed } from '@angular/core/testing';
import { SubjectService } from './subject.service';
import { Firestore } from '@angular/fire/firestore';
import { SubjectModel } from '../../models/subjectModel';

describe('SubjectService (DB CRUD Operations)', () => {
  let service: SubjectService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SubjectService,
        { provide: Firestore, useValue: {} }
      ]
    });
    service = TestBed.inject(SubjectService);

    // Mock internal Firestore wrapper methods to prevent actual DB calls
    spyOn<any>(service, 'docFn').and.returnValue('mock-doc-ref');
    spyOn<any>(service, 'collectionFn').and.returnValue('mock-collection-ref');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Database Operations (CRUD)', () => {

    it('READ: should fetch a subject using getDoc (fetchSubject)', async () => {
      const mockSubjectData = { name: 'Math' };
      
      const getDocSpy = spyOn<any>(service, 'getDocFn').and.returnValue(Promise.resolve({
        exists: () => true,
        id: 'test-subject-id',
        data: () => mockSubjectData
      }));

      const subject = await service.fetchSubject('test-subject-id');
      
      expect((service as any)['docFn']).toHaveBeenCalledWith(jasmine.anything(), 'subjects', 'test-subject-id');
      expect(getDocSpy).toHaveBeenCalledWith('mock-doc-ref' as any);
      expect(subject).toBeTruthy();
      expect(subject?.key).toBe('test-subject-id');
      expect(subject?.name).toBe('Math');
    });

    it('WRITE: should add a new subject using addDoc (createSubject)', async () => {
      const addDocSpy = spyOn<any>(service, 'addDocFn').and.returnValue(Promise.resolve({ id: 'mock-new-doc-ref' }));

      const newSubject = new SubjectModel({ name: 'Science' });
      // The service calls serialize() *before* it assigns the key.
      const expectedSerialized = newSubject.serialize();
      
      await service.createSubject(newSubject);

      expect((service as any)['collectionFn']).toHaveBeenCalledWith(jasmine.anything(), 'subjects');
      expect(addDocSpy).toHaveBeenCalledWith('mock-collection-ref' as any, expectedSerialized);
      expect(newSubject.key).toBe('mock-new-doc-ref');
    });

    it('UPDATE: should update a subject using setDoc (updateSubject)', async () => {
      const setDocSpy = spyOn<any>(service, 'setDocFn').and.returnValue(Promise.resolve());
      const updatedSubject = new SubjectModel({ name: 'Updated Science' });
      updatedSubject.key = 'test-update-id';
      
      await service.updateSubject(updatedSubject);

      expect((service as any)['docFn']).toHaveBeenCalledWith(jasmine.anything(), 'subjects', 'test-update-id');
      expect(setDocSpy).toHaveBeenCalledWith('mock-doc-ref' as any, updatedSubject.serialize(), { merge: true });
    });

    it('DELETE: should delete a subject using deleteDoc (deleteSubject)', async () => {
      const deleteDocSpy = spyOn<any>(service, 'deleteDocFn').and.returnValue(Promise.resolve());
      
      await service.deleteSubject('test-delete-id');

      expect((service as any)['docFn']).toHaveBeenCalledWith(jasmine.anything(), 'subjects', 'test-delete-id');
      expect(deleteDocSpy).toHaveBeenCalledWith('mock-doc-ref' as any);
    });

  });
});
