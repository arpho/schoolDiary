import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimeslotDialogComponent } from './timeslot-dialog.component';
import { UsersService } from 'src/app/shared/services/users.service';
import { SubjectService } from 'src/app/pages/subjects-list/services/subjects/subject.service';
import { ClassiService } from 'src/app/pages/classes/services/classi.service';
import { ModalController, AlertController } from '@ionic/angular/standalone';
import { of } from 'rxjs';

describe('TimeslotDialogComponent', () => {
  let component: TimeslotDialogComponent;
  let fixture: ComponentFixture<TimeslotDialogComponent>;
  let usersServiceSpy: jasmine.SpyObj<UsersService>;
  let subjectServiceSpy: jasmine.SpyObj<SubjectService>;
  let classiServiceSpy: jasmine.SpyObj<ClassiService>;
  let modalControllerSpy: jasmine.SpyObj<ModalController>;
  let alertControllerSpy: jasmine.SpyObj<AlertController>;

  beforeEach(async () => {
    usersServiceSpy = jasmine.createSpyObj('UsersService', ['getLoggedUser', 'getSubjectsForClass']);
    subjectServiceSpy = jasmine.createSpyObj('SubjectService', ['']);
    classiServiceSpy = jasmine.createSpyObj('ClassiService', ['getClassiOnRealtime']);
    modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    alertControllerSpy = jasmine.createSpyObj('AlertController', ['create']);

    usersServiceSpy.getLoggedUser.and.returnValue(Promise.resolve({
      key: 'user-id',
      schoolTimeSlots: [{ name: '1° Ora', startTime: '08:00', endTime: '09:00' }]
    } as any));

    classiServiceSpy.getClassiOnRealtime.and.returnValue(of([]));
    
    const alertSpy = jasmine.createSpyObj('HTMLIonAlertElement', ['present']);
    alertControllerSpy.create.and.returnValue(Promise.resolve(alertSpy));

    await TestBed.configureTestingModule({
      imports: [TimeslotDialogComponent],
      providers: [
        { provide: UsersService, useValue: usersServiceSpy },
        { provide: SubjectService, useValue: subjectServiceSpy },
        { provide: ClassiService, useValue: classiServiceSpy },
        { provide: ModalController, useValue: modalControllerSpy },
        { provide: AlertController, useValue: alertControllerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TimeslotDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dismiss and alert if no schoolTimeSlots', async () => {
    usersServiceSpy.getLoggedUser.and.returnValue(Promise.resolve({
      key: 'user-id',
      schoolTimeSlots: []
    } as any));

    await component.ngOnInit();
    expect(alertControllerSpy.create).toHaveBeenCalled();
    expect(modalControllerSpy.dismiss).toHaveBeenCalled();
  });

  it('should map dynamically calculated times on save', async () => {
    await component.ngOnInit();
    
    // Set some valid slots
    component.slotForm().value.update(v => ({...v, 
      slotType: 'ora_buca', 
      day: 'Monday', 
      slotNames: ['1° Ora']
    }));
    
    component.save();
    
    expect(modalControllerSpy.dismiss).toHaveBeenCalled();
    const dismissArgs = modalControllerSpy.dismiss.calls.mostRecent().args;
    const newSlot = dismissArgs[0] as any;
    expect(newSlot.startTime).toEqual('08:00');
    expect(newSlot.endTime).toEqual('09:00');
  });
});
