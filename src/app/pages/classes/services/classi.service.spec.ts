import { TestBed } from '@angular/core/testing';
import { ClassiService } from './classi.service';
import { Firestore } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { ClasseModel } from '../models/classModel';

describe('ClassiService (DB CRUD Operations)', () => {
  let service: ClassiService;

  beforeEach(() => {
    const authMock = {
      onAuthStateChanged: jasmine.createSpy('onAuthStateChanged')
    };

    TestBed.configureTestingModule({
      providers: [
        ClassiService,
        { provide: Firestore, useValue: {} },
        { provide: Auth, useValue: authMock }
      ]
    });
    service = TestBed.inject(ClassiService);

    // Mock internal Firestore wrapper methods to prevent actual DB calls
    spyOn<any>(service, 'docFn').and.returnValue('mock-doc-ref');
    spyOn<any>(service, 'collectionFn').and.returnValue('mock-collection-ref');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Database Operations (CRUD)', () => {
    
    it('READ: should fetch a class using getDoc (fetchClasse)', async () => {
      const mockClassData = { classe: '1A', section: 'A' };
      
      const getDocSpy = spyOn<any>(service, 'getDocFn').and.returnValue(Promise.resolve({
        exists: () => true,
        id: 'test-class-id',
        data: () => mockClassData
      }));

      const classe = await service.fetchClasse('test-class-id');
      
      expect((service as any)['docFn']).toHaveBeenCalledWith(jasmine.anything(), 'classi', 'test-class-id');
      expect(getDocSpy).toHaveBeenCalledWith('mock-doc-ref' as any);
      expect(classe).toBeTruthy();
      expect(classe.key).toBe('test-class-id');
      expect(classe.classe).toBe('1A');
    });

    it('WRITE: should add a new class using setDoc (addClasse)', async () => {
      const setDocSpy = spyOn<any>(service, 'setDocFn').and.returnValue(Promise.resolve());

      const newClasse = new ClasseModel({ classe: '2B' });
      await service.addClasse(newClasse);

      expect((service as any)['collectionFn']).toHaveBeenCalledWith(jasmine.anything(), 'classi');
      expect((service as any)['docFn']).toHaveBeenCalledWith('mock-collection-ref');
      expect(setDocSpy).toHaveBeenCalledWith('mock-doc-ref' as any, newClasse.serialize());
    });

    it('UPDATE: should update a class using setDoc (updateClasse)', async () => {
      const setDocSpy = spyOn<any>(service, 'setDocFn').and.returnValue(Promise.resolve());
      const updatedClasse = new ClasseModel({ classe: '3C' });
      
      await service.updateClasse('test-update-id', updatedClasse);

      expect((service as any)['docFn']).toHaveBeenCalledWith(jasmine.anything(), 'classi', 'test-update-id');
      expect(setDocSpy).toHaveBeenCalledWith('mock-doc-ref' as any, updatedClasse.serialize());
    });

    it('DELETE: should delete a class using deleteDoc (deleteClasse)', async () => {
      const deleteDocSpy = spyOn<any>(service, 'deleteDocFn').and.returnValue(Promise.resolve());
      
      await service.deleteClasse('test-delete-id');

      expect((service as any)['docFn']).toHaveBeenCalledWith(jasmine.anything(), 'classi', 'test-delete-id');
      expect(deleteDocSpy).toHaveBeenCalledWith('mock-doc-ref' as any);
    });

  });
});
