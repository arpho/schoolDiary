import { TestBed } from '@angular/core/testing';
import { AgendaService } from './agenda.service';
import { Firestore } from '@angular/fire/firestore';
import { AgendaEvent } from '../../pages/agenda/models/agendaEvent';

describe('AgendaService (DB CRUD Operations)', () => {
  let service: AgendaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AgendaService,
        { provide: Firestore, useValue: {} }
      ]
    });
    service = TestBed.inject(AgendaService);

    // Mock internal Firestore wrapper methods to prevent actual DB calls
    spyOn<any>(service, 'docFn').and.returnValue('mock-doc-ref');
    spyOn<any>(service, 'collectionFn').and.returnValue('mock-collection-ref');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Database Operations (CRUD)', () => {

    it('WRITE: should add a new event using addDoc and setDoc (addEvent)', async () => {
      const addDocSpy = spyOn<any>(service, 'addDocFn').and.returnValue(Promise.resolve('mock-new-doc-ref'));
      const setDocSpy = spyOn<any>(service, 'setDocFn').and.returnValue(Promise.resolve());

      const newEvent = new AgendaEvent({ title: 'Math Test' });
      await service.addEvent(newEvent);

      expect((service as any)['collectionFn']).toHaveBeenCalledWith(jasmine.anything(), 'agenda-events');
      expect(addDocSpy).toHaveBeenCalledWith('mock-collection-ref' as any, jasmine.any(Object));
      // Ensure it updates the document with the timestamp added internally
      expect(setDocSpy).toHaveBeenCalledWith('mock-new-doc-ref' as any, jasmine.any(Object));
    });

    it('UPDATE: should update an event using updateDoc (updateEvent)', async () => {
      const updateDocSpy = spyOn<any>(service, 'updateDocFn').and.returnValue(Promise.resolve());
      const updatedEvent = new AgendaEvent({ title: 'Math Test Updated' });
      updatedEvent.setKey('test-update-id');
      
      await service.updateEvent(updatedEvent);

      expect((service as any)['docFn']).toHaveBeenCalledWith(jasmine.anything(), 'agenda-events/test-update-id');
      expect(updateDocSpy).toHaveBeenCalledWith('mock-doc-ref' as any, updatedEvent.serialize());
    });

    it('DELETE: should delete an event using deleteDoc (deleteEvent)', async () => {
      const deleteDocSpy = spyOn<any>(service, 'deleteDocFn').and.returnValue(Promise.resolve());
      
      await service.deleteEvent('test-delete-id');

      expect((service as any)['docFn']).toHaveBeenCalledWith(jasmine.anything(), 'agenda-events/test-delete-id');
      expect(deleteDocSpy).toHaveBeenCalledWith('mock-doc-ref' as any);
    });

  });
});
