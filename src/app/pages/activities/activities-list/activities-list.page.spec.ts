import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { ActivitiesListPage } from './activities-list.page';
import { UsersService } from '../../../shared/services/users.service';
import { ActivitiesService } from '../services/activities.service';
import { ClassiService } from 'src/app/pages/classes/services/classi.service';
import { SubjectService } from 'src/app/pages/subjects-list/services/subjects/subject.service';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { UserModel } from 'src/app/shared/models/userModel';


describe('ActivitiesListPage', () => {
  let component: ActivitiesListPage;
  let fixture: ComponentFixture<ActivitiesListPage>;

  beforeEach(waitForAsync(() => {
    const usersSpy = jasmine.createSpyObj('UsersService', ['getLoggedUser']);
    const activitiesSpy = jasmine.createSpyObj('ActivitiesService', ['addActivity', 'getActivities4teacherOnRealtime']);
    const classiSpy = jasmine.createSpyObj('ClassiService', ['fetchClasseOnCache']);
    const subjectSpy = jasmine.createSpyObj('SubjectService', ['fetchSubjectsByKeys']);
    const modalSpy = jasmine.createSpyObj('ModalController', ['create', 'dismiss']);
    const activatedRouteSpy = {
      queryParams: of({}),
      snapshot: { paramMap: { get: () => '' } }
    };

    // return a promise with a mock user
    usersSpy.getLoggedUser.and.returnValue(Promise.resolve(new UserModel()));

    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), ActivitiesListPage],
      providers: [
        { provide: UsersService, useValue: usersSpy },
        { provide: ActivitiesService, useValue: activitiesSpy },
        { provide: ClassiService, useValue: classiSpy },
        { provide: SubjectService, useValue: subjectSpy },
        { provide: ModalController, useValue: modalSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ActivitiesListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
