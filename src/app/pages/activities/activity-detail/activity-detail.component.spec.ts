import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ActivityDetailComponent } from './activity-detail.component';
import { ActivatedRoute } from '@angular/router';
import { ActivitiesService } from '../services/activities.service';
import { ActivityModel } from '../models/activityModel';
import { ClassiService } from '../../classes/services/classi.service';
import { UsersService } from 'src/app/shared/services/users.service';

describe('ActivityDetailComponent', () => {
  let component: ActivityDetailComponent;
  let fixture: ComponentFixture<ActivityDetailComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ActivityDetailComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } },
        { provide: ActivitiesService, useValue: { getActivity: jasmine.createSpy('getActivity').and.returnValue(Promise.resolve(new ActivityModel())) } },
        { provide: ClassiService, useValue: { fetchClasse: jasmine.createSpy('fetchClasse').and.returnValue(Promise.resolve(null)) } },
        { provide: UsersService, useValue: { fetchUser: jasmine.createSpy('fetchUser').and.returnValue(Promise.resolve(null)) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
