import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfilePage } from './profile.page';

import { provideRouter, ActivatedRoute } from '@angular/router';
import { UsersService } from 'src/app/shared/services/users.service';
import { ClassiService } from 'src/app/pages/classes/services/classi.service';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { of } from 'rxjs';
import { UserModel } from 'src/app/shared/models/userModel';
import { ReactiveFormsModule } from '@angular/forms';

describe('ProfilePage', () => {
  let component: ProfilePage;
  let fixture: ComponentFixture<ProfilePage>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ProfilePage, ReactiveFormsModule],
      providers: [
        provideRouter([]),
        { provide: UsersService, useValue: { fetchUser: jasmine.createSpy('fetchUser').and.returnValue(Promise.resolve(new UserModel())), updateUser: jasmine.createSpy('updateUser') } },
        { provide: ClassiService, useValue: { getClassiOnRealtime: jasmine.createSpy('getClassiOnRealtime').and.returnValue(of([])) } },
        { provide: ToasterService, useValue: { showToast: jasmine.createSpy('showToast') } },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => 'test-user-key'
              }
            }
          }
        }
      ]
    });
    fixture = TestBed.createComponent(ProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
