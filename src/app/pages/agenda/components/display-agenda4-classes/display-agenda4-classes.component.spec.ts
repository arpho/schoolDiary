import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular/standalone';

import { DisplayAgenda4ClassesComponent } from './display-agenda4-classes.component';
import { ClassiService } from 'src/app/pages/classes/services/classi.service';
import { AgendaService } from 'src/app/shared/services/agenda.service';
import { of } from 'rxjs';

describe('DisplayAgenda4ClassesComponent', () => {
  let component: DisplayAgenda4ClassesComponent;
  let fixture: ComponentFixture<DisplayAgenda4ClassesComponent>;

  const classiServiceMock = {
    fetchClasseOnCache: jasmine.createSpy('fetchClasseOnCache').and.returnValue(Promise.resolve({})),
    getAllClasses: jasmine.createSpy('getAllClasses').and.returnValue([])
  };

  const agendaServiceMock = {
    getAgenda4targetedClassesOnrealtime: jasmine.createSpy('getAgenda4targetedClassesOnrealtime')
  };

  const modalCtrlMock = {
    create: jasmine.createSpy('create').and.returnValue(Promise.resolve({
      present: jasmine.createSpy('present')
    }))
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), DisplayAgenda4ClassesComponent],
      providers: [
        { provide: ClassiService, useValue: classiServiceMock },
        { provide: AgendaService, useValue: agendaServiceMock },
        { provide: ModalController, useValue: modalCtrlMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DisplayAgenda4ClassesComponent);
    component = fixture.componentInstance;
    
    // Set required input
    fixture.componentRef.setInput('targetedClasses', ['class1']);
    
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
