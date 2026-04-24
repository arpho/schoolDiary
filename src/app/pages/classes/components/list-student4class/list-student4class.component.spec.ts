import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { ListStudent4classComponent } from './list-student4class.component';
import { UsersService } from 'src/app/shared/services/users.service';
import { EvaluationService } from 'src/app/pages/evaluations/services/evaluation/evaluation.service';
import { AgendaService } from 'src/app/shared/services/agenda.service';

describe('ListStudent4classComponent', () => {
  let component: ListStudent4classComponent;
  let fixture: ComponentFixture<ListStudent4classComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), ListStudent4classComponent],
      providers: [
        { provide: UsersService, useValue: { getLoggedUser: jasmine.createSpy('getLoggedUser'), getCustomClaims4LoggedUser: jasmine.createSpy('getCustomClaims4LoggedUser'), getUserByUid: jasmine.createSpy('getUserByUid') } },
        { provide: EvaluationService, useValue: { getEvaluation4studentAndTeacher: jasmine.createSpy('getEvaluation4studentAndTeacher').and.returnValue(Promise.resolve([])) } },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'test-id' } } } },
        { provide: AgendaService, useValue: { getAgenda4targetedClassesOnrealtime: jasmine.createSpy('getAgenda4targetedClassesOnrealtime') } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ListStudent4classComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
