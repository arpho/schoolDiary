import { TestBed } from '@angular/core/testing';
import { GridsService } from './grids.service';
import { Firestore } from '@angular/fire/firestore';
import { Grids } from '../../models/grids';

describe('GridsService (DB CRUD Operations)', () => {
  let service: GridsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GridsService,
        { provide: Firestore, useValue: {} }
      ]
    });
    service = TestBed.inject(GridsService);

    // Mock internal Firestore wrapper methods to prevent actual DB calls
    spyOn<any>(service, 'docFn').and.returnValue('mock-doc-ref');
    spyOn<any>(service, 'collectionFn').and.returnValue('mock-collection-ref');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Database Operations (CRUD)', () => {

    it('READ: should fetch a grid using getDoc (fetchGrid)', async () => {
      const mockGridData = { nome: 'Test Grid' };
      
      const getDocSpy = spyOn<any>(service, 'getDocFn').and.returnValue(Promise.resolve({
        exists: () => true,
        id: 'test-grid-id',
        data: () => mockGridData
      }));

      const grid = await service.fetchGrid('test-grid-id');
      
      expect((service as any)['docFn']).toHaveBeenCalledWith(jasmine.anything(), 'grids', 'test-grid-id');
      expect(getDocSpy).toHaveBeenCalledWith('mock-doc-ref' as any);
      expect(grid).toBeTruthy();
      expect(grid?.key).toBe('test-grid-id');
      expect(grid?.nome).toBe('Test Grid');
    });

    it('WRITE: should add a new grid using addDoc (addGrid)', async () => {
      const addDocSpy = spyOn<any>(service, 'addDocFn').and.returnValue(Promise.resolve({ id: 'mock-new-doc-ref' }));

      const newGrid = new Grids({ nome: 'New Grid' });
      await service.addGrid(newGrid);

      expect((service as any)['collectionFn']).toHaveBeenCalledWith(jasmine.anything(), 'grids');
      expect(addDocSpy).toHaveBeenCalledWith('mock-collection-ref' as any, newGrid.serialize());
    });

    it('UPDATE: should update a grid using setDoc (updateGrid)', async () => {
      const setDocSpy = spyOn<any>(service, 'setDocFn').and.returnValue(Promise.resolve());
      const updatedGrid = new Grids({ nome: 'Updated Grid' });
      
      await service.updateGrid('test-update-id', updatedGrid);

      expect((service as any)['docFn']).toHaveBeenCalledWith(jasmine.anything(), 'grids', 'test-update-id');
      expect(setDocSpy).toHaveBeenCalledWith('mock-doc-ref' as any, updatedGrid.serialize());
    });

  });
});
