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

    it('UPDATE: should update an activity using setDoc (updateActivity)', async () => {
      const setDocSpy = spyOn<any>(service, 'setDocFn').and.returnValue(Promise.resolve());
      const updatedActivity = new ActivityModel({ title: 'Updated Activity' });
      
      await service.updateActivity('test-update-id', updatedActivity);

      expect((service as any)['docFn']).toHaveBeenCalledWith(jasmine.anything(), 'activities', 'test-update-id');
      expect(setDocSpy).toHaveBeenCalledWith('mock-doc-ref' as any, updatedActivity.serialize());
    });

    it('DELETE: should delete an activity using deleteDoc (deleteActivity)', async () => {
      const deleteDocSpy = spyOn<any>(service, 'deleteDocFn').and.returnValue(Promise.resolve());
      
      await service.deleteActivity('test-delete-id');

      expect((service as any)['docFn']).toHaveBeenCalledWith(jasmine.anything(), 'activities', 'test-delete-id');
      expect(deleteDocSpy).toHaveBeenCalledWith('mock-doc-ref' as any);
    });

  });
});
