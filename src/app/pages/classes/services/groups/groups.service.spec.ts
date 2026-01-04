import { TestBed } from '@angular/core/testing';
import { GroupsService } from './groups.service';
import { Firestore } from '@angular/fire/firestore';
import { UsersService } from 'src/app/shared/services/users.service';

describe('GroupsService', () => {
  let service: GroupsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Firestore, useValue: {} },
        { provide: UsersService, useValue: {} }
      ]
    });
    service = TestBed.inject(GroupsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
