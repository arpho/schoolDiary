import { TestBed } from '@angular/core/testing';
import { GroupsService } from './groups.service';
import { Firestore } from '@angular/fire/firestore';
import { UsersService } from 'src/app/shared/services/users.service';
import { GroupModel } from '../../models/groupModel';

describe('GroupsService (DB CRUD Operations)', () => {
  let service: GroupsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GroupsService,
        { provide: Firestore, useValue: {} },
        { provide: UsersService, useValue: {} }
      ]
    });
    service = TestBed.inject(GroupsService);

    // Mock internal Firestore wrapper methods to prevent actual DB calls
    spyOn<any>(service, 'docFn').and.returnValue('mock-doc-ref');
    spyOn<any>(service, 'collectionFn').and.returnValue('mock-collection-ref');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Database Operations (CRUD)', () => {

    it('WRITE: should add a new group using addDoc (createGroup)', async () => {
      const addDocSpy = spyOn<any>(service, 'addDocFn').and.returnValue(Promise.resolve({ id: 'new-group-id' }));

      const newGroup = new GroupModel({ classKey: 'class-1', title: 'New Group' }, {} as any);
      const groupId = await service.createGroup(newGroup);

      expect((service as any)['collectionFn']).toHaveBeenCalledWith(jasmine.anything(), 'groups');
      expect(addDocSpy).toHaveBeenCalledWith('mock-collection-ref' as any, newGroup.serialize());
      expect(groupId).toBe('new-group-id');
    });

    it('UPDATE: should update a group using setDoc (updateGroup)', async () => {
      const setDocSpy = spyOn<any>(service, 'setDocFn').and.returnValue(Promise.resolve());
      const updatedGroup = new GroupModel({ key: 'test-update-id', classKey: 'class-1', title: 'Updated Group' }, {} as any);
      
      await service.updateGroup(updatedGroup);

      expect((service as any)['docFn']).toHaveBeenCalledWith(jasmine.anything(), 'groups/test-update-id');
      expect(setDocSpy).toHaveBeenCalledWith('mock-doc-ref' as any, updatedGroup.serialize(), { merge: true });
    });

    it('DELETE: should delete a group using deleteDoc (deleteGroup)', async () => {
      const deleteDocSpy = spyOn<any>(service, 'deleteDocFn').and.returnValue(Promise.resolve());
      
      await service.deleteGroup('test-delete-id');

      expect((service as any)['docFn']).toHaveBeenCalledWith(jasmine.anything(), 'groups/test-delete-id');
      expect(deleteDocSpy).toHaveBeenCalledWith('mock-doc-ref' as any);
    });

    it('BATCH UPDATE: should update two groups using writeBatch (UpdateOriginAndDestinationGroups)', async () => {
      const mockBatch = {
        update: jasmine.createSpy('update'),
        commit: jasmine.createSpy('commit').and.returnValue(Promise.resolve())
      };
      spyOn<any>(service, 'writeBatchFn').and.returnValue(mockBatch);

      const originGroup = new GroupModel({ key: 'origin-id', classKey: 'class-1', title: 'Origin' }, {} as any);
      const destGroup = new GroupModel({ key: 'dest-id', classKey: 'class-1', title: 'Destination' }, {} as any);

      await service.UpdateOriginAndDestinationGroups(originGroup, destGroup);

      expect((service as any)['writeBatchFn']).toHaveBeenCalledWith(jasmine.anything());
      expect(mockBatch.update).toHaveBeenCalledTimes(2);
      expect(mockBatch.commit).toHaveBeenCalled();
    });

  });
});
