import { TestBed } from '@angular/core/testing';

import { ClassReservedNotesService } from './class-reserved-notes.service';
import { Firestore } from '@angular/fire/firestore';

describe('ClassReservedNotesService', () => {
  let service: ClassReservedNotesService;

  beforeEach(() => {
    spyOn(ClassReservedNotesService.prototype as any, 'getNotesOnRealtime').and.stub();

    TestBed.configureTestingModule({
      providers: [
        { provide: Firestore, useValue: { type: 'firestore', _app: { options: {} }, toJSON: () => ({}) } }
      ]
    });
    service = TestBed.inject(ClassReservedNotesService);
    // Spy on protected methods to avoid actual Firestore calls if called later
    spyOn<any>(service, 'getCollectionRef').and.returnValue({});
    spyOn<any>(service, 'getDocRef').and.returnValue({});
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
