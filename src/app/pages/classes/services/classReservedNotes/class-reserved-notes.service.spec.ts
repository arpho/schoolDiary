import { TestBed } from '@angular/core/testing';
import { ClassReservedNotesService } from './class-reserved-notes.service';
import { Firestore } from '@angular/fire/firestore';
import { ReservedNotes4class } from '../../models/reservedNotes4class';

describe('ClassReservedNotesService (DB CRUD Operations)', () => {
  let service: ClassReservedNotesService;

  beforeEach(() => {
    spyOn(ClassReservedNotesService.prototype as any, 'getNotesOnRealtime').and.stub();

    TestBed.configureTestingModule({
      providers: [
        ClassReservedNotesService,
        { provide: Firestore, useValue: {} }
      ]
    });
    service = TestBed.inject(ClassReservedNotesService);

    // Mock internal Firestore wrapper methods to prevent actual DB calls
    spyOn<any>(service, 'docFn').and.returnValue('mock-doc-ref');
    spyOn<any>(service, 'collectionFn').and.returnValue('mock-collection-ref');
    spyOn<any>(service, 'getCollectionRef').and.returnValue('mock-collection-ref');
    spyOn<any>(service, 'getDocRef').and.returnValue('mock-doc-ref');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Database Operations (CRUD)', () => {
    
    it('READ: should fetch a note using getDoc (fetchNote)', async () => {
      const mockNoteData = { note: 'Test Note' };
      
      const getDocSpy = spyOn<any>(service, 'getDocFn').and.returnValue(Promise.resolve({
        id: 'test-note-id',
        data: () => mockNoteData
      }));

      const note = await service.fetchNote('test-note-id');
      
      expect((service as any)['getDocRef']).toHaveBeenCalledWith('test-note-id');
      expect(getDocSpy).toHaveBeenCalledWith('mock-doc-ref' as any);
      expect(note).toBeTruthy();
      expect(note.key).toBe('test-note-id');
      expect(note.note).toBe('Test Note');
    });

    it('WRITE: should add a new note using addDoc (addNote)', async () => {
      const addDocSpy = spyOn<any>(service, 'addDocFn').and.returnValue(Promise.resolve('mock-new-doc-ref'));

      const newNote = new ReservedNotes4class({ note: 'New Note' });
      await service.addNote(newNote);

      expect((service as any)['getCollectionRef']).toHaveBeenCalled();
      expect(addDocSpy).toHaveBeenCalledWith('mock-collection-ref' as any, newNote.serialize());
    });

    it('UPDATE: should update a note using setDoc (updateNote)', async () => {
      const setDocSpy = spyOn<any>(service, 'setDocFn').and.returnValue(Promise.resolve());
      const updatedNote = new ReservedNotes4class({ note: 'Updated Note' });
      
      await service.updateNote('test-update-id', updatedNote);

      expect((service as any)['getDocRef']).toHaveBeenCalledWith('test-update-id');
      expect(setDocSpy).toHaveBeenCalledWith('mock-doc-ref' as any, updatedNote.serialize());
    });

    it('DELETE: should delete a note using deleteDoc (deleteNote)', async () => {
      const deleteDocSpy = spyOn<any>(service, 'deleteDocFn').and.returnValue(Promise.resolve());
      
      await service.deleteNote('test-delete-id');

      expect((service as any)['getDocRef']).toHaveBeenCalledWith('test-delete-id');
      expect(deleteDocSpy).toHaveBeenCalledWith('mock-doc-ref' as any);
    });

  });
});
