import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityDetailComponent } from './activity-detail.component';
import { ActivatedRoute } from '@angular/router';
import { ActivitiesService } from '../services/activities.service';
import { ActivityModel } from '../models/activityModel';
import { ClassiService } from '../../classes/services/classi.service';
import { UsersService } from 'src/app/shared/services/users.service';

describe('ActivityDetailComponent', () => {
  let component: ActivityDetailComponent;
  let fixture: ComponentFixture<ActivityDetailComponent>;
  let updateActivitySpy: jasmine.Spy;

  beforeEach(async () => {
    const existingActivity = new ActivityModel({
      key: '1',
      title: 'Titolo iniziale',
      description: 'Descrizione valida iniziale',
      classKey: 'class-1',
      teacherKey: 'teacher-1',
      date: '2025-05-10T00:00:00.000Z'
    }).setKey('1');

    updateActivitySpy = jasmine.createSpy('updateActivity').and.returnValue(Promise.resolve());

    await TestBed.configureTestingModule({
      imports: [ActivityDetailComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } },
        {
          provide: ActivitiesService,
          useValue: {
            getActivity: jasmine.createSpy('getActivity').and.returnValue(Promise.resolve(existingActivity)),
            updateActivity: updateActivitySpy
          }
        },
        { provide: ClassiService, useValue: { fetchClasse: jasmine.createSpy('fetchClasse').and.returnValue(Promise.resolve(null)) } },
        { provide: UsersService, useValue: { fetchUser: jasmine.createSpy('fetchUser').and.returnValue(Promise.resolve(null)) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should submit an ActivityModel instance to updateActivity when saving changes', async () => {
    component.toggleEditMode();
    component.activityForm.patchValue({
      title: 'Titolo aggiornato',
      description: 'Descrizione aggiornata valida'
    });

    await component.onSubmit();

    expect(updateActivitySpy).toHaveBeenCalledTimes(1);
    const [keyArg, modelArg] = updateActivitySpy.calls.mostRecent().args;
    expect(keyArg).toBe('1');
    expect(modelArg instanceof ActivityModel).toBeTrue();
    expect(typeof modelArg.serialize).toBe('function');
    expect(modelArg.title).toBe('Titolo aggiornato');
    expect(component.isEditMode).toBeFalse();
  });
});
