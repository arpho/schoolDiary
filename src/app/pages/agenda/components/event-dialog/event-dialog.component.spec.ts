import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { ModalController } from '@ionic/angular/standalone';
import { EventDialogComponent } from './event-dialog.component';
import { AgendaService } from 'src/app/shared/services/agenda.service';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { UsersService } from 'src/app/shared/services/users.service';
import { SubjectService } from 'src/app/pages/subjects-list/services/subjects/subject.service';

describe('EventDialogComponent', () => {
  let component: EventDialogComponent;
  let fixture: ComponentFixture<EventDialogComponent>;

  const agendaServiceMock = {
    addEvent: jasmine.createSpy('addEvent'),
    updateEvent: jasmine.createSpy('updateEvent')
  };

  const toasterServiceMock = {
    showToast: jasmine.createSpy('showToast')
  };

  const modalCtrlMock = {
    dismiss: jasmine.createSpy('dismiss')
  };

  const usersServiceMock = {
    getUsersByClass: jasmine.createSpy('getUsersByClass').and.callFake((c: any, cb: any) => cb([])),
    getLoggedUser: jasmine.createSpy('getLoggedUser').and.returnValue(Promise.resolve(null))
  };

  const subjectServiceMock = {
    fetchSubjectsByKeys: jasmine.createSpy('fetchSubjectsByKeys').and.returnValue(Promise.resolve([]))
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [EventDialogComponent],
      providers: [
        provideIonicAngular(),
        { provide: AgendaService, useValue: agendaServiceMock },
        { provide: ToasterService, useValue: toasterServiceMock },
        { provide: ModalController, useValue: modalCtrlMock },
        { provide: UsersService, useValue: usersServiceMock },
        { provide: SubjectService, useValue: subjectServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EventDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
