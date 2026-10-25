import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ActivityDialogComponent } from './activity-dialog.component';
import { UsersService } from 'src/app/shared/services/users.service';
import { ModalController } from '@ionic/angular/standalone';
import { DatePipe } from '@angular/common';
import { ActivityModel } from '../../../models/activityModel';
import { ClasseModel } from 'src/app/pages/classes/models/classModel';

describe('ActivityDialogComponent', () => {
  let component: ActivityDialogComponent;
  let fixture: ComponentFixture<ActivityDialogComponent>;
  let modalDismissSpy: jasmine.Spy;
  let getLoggedUserSpy: jasmine.Spy;

  beforeEach(async () => {
    modalDismissSpy = jasmine.createSpy('dismiss').and.returnValue(Promise.resolve(true));
    getLoggedUserSpy = jasmine.createSpy('getLoggedUser').and.returnValue(Promise.resolve({ key: 'teacher-1' }));

    await TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), ActivityDialogComponent],
      providers: [
        { provide: UsersService, useValue: { getLoggedUser: getLoggedUserSpy } },
        { provide: ModalController, useValue: { dismiss: modalDismissSpy } },
        DatePipe
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should allow editing an existing activity with a past date and preserve its key', async () => {
    const pastActivity = new ActivityModel({
      key: 'act-past-1',
      title: 'Verifica Storia',
      description: 'Capitoli 1 e 2 del manuale',
      classKey: 'class-1',
      teacherKey: 'teacher-1',
      date: '2024-03-10T08:00:00.000Z'
    }).setKey('act-past-1');

    component.listaClassi = [new ClasseModel({ key: 'class-1', classe: '3A' })];
    component.listaMaterie = [];
    component.activity = pastActivity;
    component.ngOnInit();

    component.activityForm().value.update(v => ({
      ...v,
      title: 'Verifica Storia Modificata'
    }));

    await component.onSubmit();

    expect(component.errorMessage()).toBe('');
    expect(modalDismissSpy).toHaveBeenCalledTimes(1);
    const dismissedArg = modalDismissSpy.calls.mostRecent().args[0];
    expect(dismissedArg instanceof ActivityModel).toBeTrue();
    expect(dismissedArg.key).toBe('act-past-1');
    expect(dismissedArg.title).toBe('Verifica Storia Modificata');
  });

  it('should populate errorMessage and not dismiss when submitting invalid form', async () => {
    component.activityForm().value.update(v => ({
      ...v,
      title: 'ab',
      description: 'corta',
      classKey: ''
    }));

    await component.onSubmit();

    expect(component.isSubmitted()).toBeTrue();
    expect(component.errorMessage()).not.toBe('');
    expect(modalDismissSpy).not.toHaveBeenCalled();
  });
});
