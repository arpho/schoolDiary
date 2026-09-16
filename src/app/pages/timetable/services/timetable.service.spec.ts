import { TestBed } from '@angular/core/testing';
import { TimetableService } from './timetable.service';
import { Firestore } from '@angular/fire/firestore';
import { TimetableModel } from '../models/timetable.model';

describe('TimetableService (DB CRUD Operations)', () => {
  let service: TimetableService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TimetableService,
        { provide: Firestore, useValue: {} }
      ]
    });
    service = TestBed.inject(TimetableService);

    // Mock internal Firestore wrapper methods to prevent actual DB calls
    spyOn<any>(service, 'docFn').and.returnValue('mock-doc-ref');
    spyOn<any>(service, 'collectionFn').and.returnValue('mock-collection-ref');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Database Operations (CRUD)', () => {

    it('READ: should fetch a timetable item using getDoc (fetchTimetableItem)', async () => {
      const mockTimetableData = { description: 'Math class' };
      
      const getDocSpy = spyOn<any>(service, 'getDocFn').and.returnValue(Promise.resolve({
        exists: () => true,
        id: 'test-timetable-id',
        data: () => mockTimetableData
      }));

      const timetableItem = await service.fetchTimetableItem('test-timetable-id');
      
      expect((service as any)['docFn']).toHaveBeenCalledWith(jasmine.anything(), 'timetable', 'test-timetable-id');
      expect(getDocSpy).toHaveBeenCalledWith('mock-doc-ref' as any);
      expect(timetableItem).toBeTruthy();
      expect(timetableItem?.key).toBe('test-timetable-id');
      expect(timetableItem?.description).toBe('Math class');
    });

    it('WRITE: should add a new timetable item using addDoc (createTimetableItem)', async () => {
      const addDocSpy = spyOn<any>(service, 'addDocFn').and.returnValue(Promise.resolve({ id: 'mock-new-doc-ref' }));

      const newItem = new TimetableModel({ description: 'Science class' });
      // The service calls serialize() *before* it assigns the key.
      const expectedSerialized = newItem.serialize();
      await service.createTimetableItem(newItem);

      expect((service as any)['collectionFn']).toHaveBeenCalledWith(jasmine.anything(), 'timetable');
      expect(addDocSpy).toHaveBeenCalledWith('mock-collection-ref' as any, expectedSerialized);
      expect(newItem.key).toBe('mock-new-doc-ref');
    });

    it('UPDATE: should update a timetable item using setDoc (updateTimetableItem)', async () => {
      const setDocSpy = spyOn<any>(service, 'setDocFn').and.returnValue(Promise.resolve());
      const updatedItem = new TimetableModel({ key: 'test-update-id', description: 'Updated Science class' });
      
      await service.updateTimetableItem(updatedItem);

      expect((service as any)['docFn']).toHaveBeenCalledWith(jasmine.anything(), 'timetable', 'test-update-id');
      expect(setDocSpy).toHaveBeenCalledWith('mock-doc-ref' as any, updatedItem.serialize(), { merge: true });
    });

    it('DELETE: should delete a timetable item using deleteDoc (deleteTimetableItem)', async () => {
      const deleteDocSpy = spyOn<any>(service, 'deleteDocFn').and.returnValue(Promise.resolve());
      
      await service.deleteTimetableItem('test-delete-id');

      expect((service as any)['docFn']).toHaveBeenCalledWith(jasmine.anything(), 'timetable', 'test-delete-id');
      expect(deleteDocSpy).toHaveBeenCalledWith('mock-doc-ref' as any);
    });

  });
});
