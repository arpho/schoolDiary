import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, AlertController } from '@ionic/angular';
import { GroupsService } from '../../services/groups/groups.service';
import { ClassiService } from '../../services/classi.service';
import { UsersService } from 'src/app/shared/services/users.service';
import { ToasterService } from 'src/app/shared/services/toaster.service';

import { GroupsManagerComponent } from './groups-manager.component';

describe('GroupsManagerComponent', () => {
  let component: GroupsManagerComponent;
  let fixture: ComponentFixture<GroupsManagerComponent>;

  beforeEach(waitForAsync(() => {
    const groupsServiceSpy = jasmine.createSpyObj('GroupsService', ['getGroups', 'fetchGroups4class']);
    const classiServiceSpy = jasmine.createSpyObj('ClassiService', ['fetchClasse']);
    const usersServiceSpy = jasmine.createSpyObj('UsersService', ['getUsersByClass']);
    const alertSpy = jasmine.createSpyObj('AlertController', ['create']);
    const toasterSpy = jasmine.createSpyObj('ToasterService', ['showToast']);

    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), GroupsManagerComponent],
      providers: [
        { provide: GroupsService, useValue: groupsServiceSpy },
        { provide: ClassiService, useValue: classiServiceSpy },
        { provide: UsersService, useValue: usersServiceSpy },
        { provide: AlertController, useValue: alertSpy },
        { provide: ToasterService, useValue: toasterSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GroupsManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
