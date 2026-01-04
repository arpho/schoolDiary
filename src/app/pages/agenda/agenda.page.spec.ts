import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AgendaPage } from './agenda.page';
import { UsersService } from '../../shared/services/users.service';
import { AgendaService } from 'src/app/shared/services/agenda.service';
import { ClassiService } from 'src/app/pages/classes/services/classi.service';
import { ModalController } from '@ionic/angular/standalone';
import { IonicModule } from '@ionic/angular';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('AgendaPage', () => {
  let component: AgendaPage;
  let fixture: ComponentFixture<AgendaPage>;

  const usersServiceMock = {
    getLoggedUser: jasmine.createSpy('getLoggedUser').and.returnValue(Promise.resolve({ key: 'user1', classesKey: ['class1'] }))
  };

  const agendaServiceMock = {
    getAgenda4targetedClassesOnrealtime: jasmine.createSpy('getAgenda4targetedClassesOnrealtime').and.callFake((cb: any) => cb([]))
  };

  const classesServiceMock = {
    fetchClasseOnCache: jasmine.createSpy('fetchClasseOnCache').and.returnValue(Promise.resolve({ classe: '1A' }))
  };

  const modalCtrlMock = {
    create: jasmine.createSpy('create').and.returnValue(Promise.resolve({ present: jasmine.createSpy('present') }))
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [AgendaPage, IonicModule], // AgendaPage is standalone
      providers: [
        { provide: UsersService, useValue: usersServiceMock },
        { provide: AgendaService, useValue: agendaServiceMock },
        { provide: ClassiService, useValue: classesServiceMock },
        { provide: ModalController, useValue: modalCtrlMock },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AgendaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
