import { TestBed } from '@angular/core/testing';
import { ActivitiesService } from './activities.service';
import { Firestore } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { UsersService } from 'src/app/shared/services/users.service';
import { ActivityModel } from '../models/activityModel';

describe('ActivitiesService (DB CRUD Operations)', () => {
  let service: ActivitiesService;

  beforeEach(() => {
    const authMock = {
      onAuthStateChanged: jasmine.createSpy('onAuthStateChanged')
    };

    TestBed.configureTestingModule({
      providers: [
        ActivitiesService,
        { provide: Firestore, useValue: {} },
        { provide: Auth, useValue: authMock },
        { provide: UsersService, useValue: {} }
      ]
    });
    service = TestBed.inject(ActivitiesService);

    // Mock internal Firestore wrapper methods to prevent actual DB calls
    spyOn<any>(service, 'docFn').and.returnValue('mock-doc-ref');
    spyOn<any>(service, 'collectionFn').and.returnValue('mock-collection-ref');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Database Operations (CRUD)', () => {
    
    it('READ: should fetch an activity using getDoc (getActivity)', async () => {
      const mockActivityData = { title: 'Test Activity' };
      
      const getDocSpy = spyOn<any>(service, 'getDocFn').and.returnValue(Promise.resolve({
        exists: () => true,
        id: 'test-activity-id',
        data: () => mockActivityData
      }));

      const activity = await service.getActivity('test-activity-id');
      
      expect((service as any)['docFn']).toHaveBeenCalledWith(jasmine.anything(), 'activities', 'test-activity-id');
      expect(getDocSpy).toHaveBeenCalledWith('mock-doc-ref' as any);
      expect(activity).toBeTruthy();
      expect(activity?.key).toBe('test-activity-id');
      expect(activity?.title).toBe('Test Activity');
    });

    it('WRITE: should add a new activity using addDoc and getDoc (addActivity)', async () => {
      const addDocSpy = spyOn<any>(service, 'addDocFn').and.returnValue(Promise.resolve('mock-new-doc-ref'));
      const getDocSpy = spyOn<any>(service, 'getDocFn').and.returnValue(Promise.resolve({
        exists: () => true,
        id: 'new-activity-id',
        data: () => ({ title: 'New Activity' })
      }));

      const newActivity = new ActivityModel({ title: 'New Activity' });
      await service.addActivity(newActivity);

      expect((service as any)['collectionFn']).toHaveBeenCalledWith(jasmine.anything(), 'activities');
      expect(addDocSpy).toHaveBeenCalledWith('mock-collection-ref' as any, newActivity.serialize());
      expect(getDocSpy).toHaveBeenCalledWith('mock-new-doc-ref' as any);
    });

    it('UPDATE: should update an activity using setDoc (updateActivity) and refresh cache', async () => {
      const getDocSpy = spyOn<any>(service, 'getDocFn').and.returnValue(Promise.resolve({
        exists: () => true,
        id: 'test-update-id',
        data: () => ({ title: 'Initial Title', description: 'Initial description' })
      }));
      await service.getActivity('test-update-id');
      expect(getDocSpy).toHaveBeenCalledTimes(1);

      const setDocSpy = spyOn<any>(service, 'setDocFn').and.returnValue(Promise.resolve());
      const updatedActivity = new ActivityModel({ title: 'Updated Activity', description: 'Updated description' });
      
      await service.updateActivity('test-update-id', updatedActivity);

      expect((service as any)['docFn']).toHaveBeenCalledWith(jasmine.anything(), 'activities', 'test-update-id');
      expect(setDocSpy).toHaveBeenCalledWith('mock-doc-ref' as any, updatedActivity.setKey('test-update-id').serialize());

      const cachedAfterUpdate = await service.getActivity('test-update-id');
      expect(cachedAfterUpdate?.title).toBe('Updated Activity');
      expect(getDocSpy).toHaveBeenCalledTimes(1);
    });

    it('UPDATE: should accept plain object in updateActivity without throwing serialize error', async () => {
      const setDocSpy = spyOn<any>(service, 'setDocFn').and.returnValue(Promise.resolve());
      const plainActivity = {
        key: 'plain-id',
        title: 'Plain Updated',
        description: 'Plain description text',
        classKey: 'c1',
        date: '2026-01-10T00:00:00.000Z',
        teacherKey: 't1',
        dueDate: '',
        subjectsKey: 's1'
      } as unknown as ActivityModel;

      await service.updateActivity('plain-id', plainActivity);

      expect(setDocSpy).toHaveBeenCalledWith('mock-doc-ref' as any, jasmine.objectContaining({
        key: 'plain-id',
        title: 'Plain Updated'
      }));
    });

    it('REALTIME: should emit fresh array references without duplicating items across snapshots', () => {
      spyOn<any>(service, 'queryFn').and.returnValue('mock-query');
      spyOn<any>(service, 'whereFn').and.returnValue('mock-where');
      spyOn<any>(service, 'orderByFn').and.returnValue('mock-order');

      let snapshotHandler: ((snap: any) => void) | undefined;
      spyOn<any>(service, 'onSnapshotFn').and.callFake((_q: any, cb: (snap: any) => void) => {
        snapshotHandler = cb;
        return () => {};
      });

      const emissions: ActivityModel[][] = [];
      service.getActivities4teacherOnRealtime('teacher-1', (items) => {
        emissions.push(items);
      });

      snapshotHandler!([
        { id: 'act-1', data: () => ({ title: 'V1' }) }
      ]);
      snapshotHandler!([
        { id: 'act-1', data: () => ({ title: 'V2' }) }
      ]);

      expect(emissions.length).toBe(2);
      expect(emissions[0]).not.toBe(emissions[1]);
      expect(emissions[1].length).toBe(1);
      expect(emissions[1][0].title).toBe('V2');
    });

    it('DELETE: should delete an activity using deleteDoc (deleteActivity)', async () => {
      const deleteDocSpy = spyOn<any>(service, 'deleteDocFn').and.returnValue(Promise.resolve());
      
      await service.deleteActivity('test-delete-id');

      expect((service as any)['docFn']).toHaveBeenCalledWith(jasmine.anything(), 'activities', 'test-delete-id');
      expect(deleteDocSpy).toHaveBeenCalledWith('mock-doc-ref' as any);
    });

  });
});
