import { TestBed } from '@angular/core/testing';
import { ReservedNotes4studentsService } from './reserved-notes4students.service';
import { Firestore } from '@angular/fire/firestore';
import { ReservedNotes4student } from '../../models/reservedNotes4student';

describe('ReservedNotes4studentsService (DB CRUD Operations)', () => {
  let service: ReservedNotes4studentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ReservedNotes4studentsService,
        { provide: Firestore, useValue: {} }
      ]
    });
    service = TestBed.inject(ReservedNotes4studentsService);

    // Mock internal Firestore wrapper methods to prevent actual DB calls
    spyOn<any>(service, 'docFn').and.returnValue('mock-doc-ref');
    spyOn<any>(service, 'collectionFn').and.returnValue('mock-collection-ref');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Database Operations (CRUD)', () => {
    
    it('READ LIST: should query and fetch notes using getDocs (getNotesByStudentAndOwner)', async () => {
      const getDocsSpy = spyOn<any>(service, 'getDocsFn').and.returnValue(Promise.resolve([
        { id: 'note-1', data: () => ({ note: 'Test note 1' }) },
        { id: 'note-2', data: () => ({ note: 'Test note 2' }) }
      ]));
      spyOn<any>(service, 'queryFn').and.returnValue('mock-query-ref');
      spyOn<any>(service, 'whereFn').and.returnValue('mock-where-ref');

      const notes = await service.getNotesByStudentAndOwner('student-1', 'owner-1');
      
      expect((service as any)['collectionFn']).toHaveBeenCalledWith(jasmine.anything(), 'reservedNotes4Student');
      expect((service as any)['whereFn']).toHaveBeenCalledWith('ownerKey', '==', 'owner-1');
      expect((service as any)['whereFn']).toHaveBeenCalledWith('studentKey', '==', 'student-1');
      expect(getDocsSpy).toHaveBeenCalledWith('mock-query-ref' as any);
      expect(notes.length).toBe(2);
      expect(notes[0].key).toBe('note-1');
    });

    it('WRITE: should add a new note using addDoc (addNote)', async () => {
      const addDocSpy = spyOn<any>(service, 'addDocFn').and.returnValue(Promise.resolve('mock-new-doc-ref'));

      const newNote = new ReservedNotes4student({ note: 'New Note' });
      await service.addNote(newNote);

      expect((service as any)['collectionFn']).toHaveBeenCalledWith(jasmine.anything(), 'reservedNotes4Student');
      expect(addDocSpy).toHaveBeenCalledWith('mock-collection-ref' as any, newNote.serialize());
    });

    it('UPDATE: should update a note using setDoc (updateNote)', async () => {
      const setDocSpy = spyOn<any>(service, 'setDocFn').and.returnValue(Promise.resolve());
      const updatedNote = new ReservedNotes4student({ note: 'Updated Note' });
      
      await service.updateNote('test-update-id', updatedNote);

      expect((service as any)['docFn']).toHaveBeenCalledWith(jasmine.anything(), 'reservedNotes4Student', 'test-update-id');
      expect(setDocSpy).toHaveBeenCalledWith('mock-doc-ref' as any, updatedNote.serialize());
    });

    it('DELETE: should delete a note using deleteDoc (deleteNote)', async () => {
      const deleteDocSpy = spyOn<any>(service, 'deleteDocFn').and.returnValue(Promise.resolve());
      
      await service.deleteNote('test-delete-id');

      expect((service as any)['docFn']).toHaveBeenCalledWith(jasmine.anything(), 'reservedNotes4Student', 'test-delete-id');
      expect(deleteDocSpy).toHaveBeenCalledWith('mock-doc-ref' as any);
    });

  });
});
