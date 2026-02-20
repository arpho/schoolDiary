import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimetablePage } from './timetable.page';
import { TimetableService } from './services/timetable.service';
import { UsersService } from 'src/app/shared/services/users.service';
import { AgendaService } from 'src/app/shared/services/agenda.service';
import { ModalController } from '@ionic/angular/standalone';

describe('TimetablePage', () => {
  let component: TimetablePage;
  let fixture: ComponentFixture<TimetablePage>;

  beforeEach(async () => {
    const timetableServiceSpy = jasmine.createSpyObj('TimetableService', ['fetchTimetableListOnRealTime', 'createTimetableItem', 'updateTimetableItem', 'deleteTimetableItem']);
    const usersServiceSpy = jasmine.createSpyObj('UsersService', ['getLoggedUser']);
    const agendaServiceSpy = jasmine.createSpyObj('AgendaService', ['getAgenda4targetedClassesOnrealtime']);
    const modalControllerSpy = jasmine.createSpyObj('ModalController', ['create']);

    usersServiceSpy.getLoggedUser.and.returnValue(Promise.resolve({ key: 'user-id', classesKey: ['class-1'] }));

    await TestBed.configureTestingModule({
      imports: [TimetablePage],
      providers: [
        { provide: TimetableService, useValue: timetableServiceSpy },
        { provide: UsersService, useValue: usersServiceSpy },
        { provide: AgendaService, useValue: agendaServiceSpy },
        { provide: ModalController, useValue: modalControllerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TimetablePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
