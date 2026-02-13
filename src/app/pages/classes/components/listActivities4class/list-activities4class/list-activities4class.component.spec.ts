import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ListActivities4classComponent } from './list-activities4class.component';
import { ActivitiesService } from 'src/app/pages/activities/services/activities.service';
import { UsersService } from 'src/app/shared/services/users.service';
import { SubjectService } from 'src/app/pages/subjects-list/services/subjects/subject.service';
import { ActionSheetController, ModalController, AlertController, ToastController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

describe('ListActivities4classComponent', () => {
  let component: ListActivities4classComponent;
  let fixture: ComponentFixture<ListActivities4classComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ListActivities4classComponent],
      providers: [
        { provide: ActivitiesService, useValue: { getActivities4teacherOnRealtime: jasmine.createSpy('getActivities4teacherOnRealtime') } },
        { provide: UsersService, useValue: { getLoggedUser: jasmine.createSpy('getLoggedUser') } },
        { provide: SubjectService, useValue: { fetchSubjectsByKeys: jasmine.createSpy('fetchSubjectsByKeys') } },
        { provide: ActionSheetController, useValue: jasmine.createSpyObj('ActionSheetController', ['create']) },
        { provide: ModalController, useValue: jasmine.createSpyObj('ModalController', ['create']) },
        { provide: AlertController, useValue: jasmine.createSpyObj('AlertController', ['create']) },
        { provide: ToastController, useValue: jasmine.createSpyObj('ToastController', ['create']) },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ListActivities4classComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('classkey', 'test-class');
    fixture.componentRef.setInput('teacherkey', 'test-teacher');
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
