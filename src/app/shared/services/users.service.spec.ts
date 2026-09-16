import { TestBed } from '@angular/core/testing';
import { UsersService } from './users.service';
import { Firestore } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { AuthService } from './auth.service';
import { ClassiService } from '../../../app/pages/classes/services/classi.service';
import { SubjectService } from 'src/app/pages/subjects-list/services/subjects/subject.service';
import { UserModel } from '../models/userModel';

describe('UsersService (DB CRUD Operations)', () => {
  let service: UsersService;

  beforeEach(() => {
    const authMock = {};
    const authServiceMock = {
      getUser: () => ({ subscribe: () => {} })
    };
    const classiServiceMock = {
      fetchClasseOnCache: jasmine.createSpy('fetchClasseOnCache'),
      fetchClasse: jasmine.createSpy('fetchClasse'),
      clearCache: jasmine.createSpy('clearCache')
    };
    const subjectServiceMock = {
      fetchSubjectsByKeys: () => Promise.resolve([])
    };

    TestBed.configureTestingModule({
      providers: [
        UsersService,
        { provide: Firestore, useValue: {} },
        { provide: Auth, useValue: authMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: ClassiService, useValue: classiServiceMock },
        { provide: SubjectService, useValue: subjectServiceMock }
      ]
    });
    service = TestBed.inject(UsersService);

    // Mock internal Firestore wrapper methods to prevent actual DB calls
    spyOn<any>(service, 'docFn').and.returnValue('mock-doc-ref');
    spyOn<any>(service, 'collectionFn').and.returnValue('mock-collection-ref');
    spyOn<any>(service, 'queryFn').and.returnValue('mock-query-ref');
    spyOn<any>(service, 'whereFn').and.returnValue('mock-where-ref');
    
    // Auth functions
    spyOn<any>(service, 'getAuthFn').and.returnValue({});
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Database Operations (CRUD)', () => {
    
    it('READ: should fetch a user using getDoc (fetchUser)', async () => {
      const mockUserData = { firstName: 'Mario', lastName: 'Rossi', email: 'mario@test.it' };
      
      const getDocSpy = spyOn<any>(service, 'getDocFn').and.returnValue(Promise.resolve({
        exists: () => true,
        id: 'test-user-id',
        data: () => mockUserData
      }));

      const user = await service.fetchUser('test-user-id');
      
      expect((service as any)['docFn']).toHaveBeenCalledWith(jasmine.anything(), 'userProfiles', 'test-user-id');
      expect(getDocSpy).toHaveBeenCalledWith('mock-doc-ref' as any);
      expect(user).toBeTruthy();
      expect(user?.key).toBe('test-user-id');
      expect(user?.firstName).toBe('Mario');
    });

    it('WRITE: should register user and save to DB using setDoc (signupUser)', async () => {
      const createUserSpy = spyOn<any>(service, 'createUserWithEmailAndPasswordFn').and.returnValue(Promise.resolve({
        user: { uid: 'new-user-uid' }
      }));
      const setDocSpy = spyOn<any>(service, 'setDocFn').and.returnValue(Promise.resolve());

      const newUser = new UserModel({ firstName: 'Luigi', lastName: 'Bianchi', email: 'luigi@test.it', password: 'password123' });
      const resultUid = await service.signupUser(newUser);

      expect(createUserSpy).toHaveBeenCalledWith(jasmine.anything(), 'luigi@test.it', 'password123');
      expect((service as any)['docFn']).toHaveBeenCalledWith('mock-collection-ref', 'new-user-uid');
      expect(setDocSpy).toHaveBeenCalled();
      // Ensure the key was updated internally
      expect(newUser.key).toBe('new-user-uid');
      expect(resultUid).toBe('new-user-uid');
    });

    it('UPDATE: should update user data using setDoc with merge: true (updateUser)', async () => {
      const setDocSpy = spyOn<any>(service, 'setDocFn').and.returnValue(Promise.resolve());
      const updatedUser = new UserModel({ firstName: 'Mario Updated' });
      
      await service.updateUser('test-update-id', updatedUser);

      expect((service as any)['docFn']).toHaveBeenCalledWith(jasmine.anything(), 'userProfiles', 'test-update-id');
      expect(setDocSpy).toHaveBeenCalledWith('mock-doc-ref' as any, jasmine.objectContaining({ firstName: 'Mario Updated' }) as any, { merge: true });
    });

    it('READ LIST: should query and fetch users using getDocs (getSubjectsForClass - internally uses getDocs)', async () => {
      const getDocsSpy = spyOn<any>(service, 'getDocsFn').and.returnValue(Promise.resolve([
        { data: () => ({ classes: ['class-1'], assignedClasses: [{ key: 'class-1', subjectsKey: ['sub-1'] }] }) }
      ]));
      
      const subjectService = TestBed.inject(SubjectService);
      spyOn(subjectService, 'fetchSubjectsByKeys').and.returnValue(Promise.resolve([{ key: 'sub-1', name: 'Math' }] as any));

      const subjects = await service.getSubjectsForClass('class-1');

      expect((service as any)['collectionFn']).toHaveBeenCalledWith(jasmine.anything(), 'userProfiles');
      expect((service as any)['whereFn']).toHaveBeenCalledWith('classes', 'array-contains', 'class-1');
      expect(getDocsSpy).toHaveBeenCalledWith('mock-query-ref' as any);
      expect(subjects.length).toBe(1);
    });

  });
});
