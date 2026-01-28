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
    fetchClasseOnCache: jasmine.createSpy('fetchClasseOnCache').and.returnValue(Promise.resolve({ classe: '1A' })),
    getAllClasses: jasmine.createSpy('getAllClasses').and.returnValue([])
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

  it('should sort events by distance from now (closest to farthest) in list view', () => {
    component.viewMode.set('list');
    // Mock Date.now to a fixed point in time
    const mockNow = new Date('2023-01-05T10:00:00Z').getTime();
    spyOn(Date, 'now').and.returnValue(mockNow);

    const events = [
      { dataInizio: '2023-01-10T10:00:00Z', title: 'Future Far' },   // +5 days
      { dataInizio: '2023-01-06T10:00:00Z', title: 'Future Near' },  // +1 day
      { dataInizio: '2023-01-04T10:00:00Z', title: 'Past Near' },    // -1 day
      { dataInizio: '2023-01-01T10:00:00Z', title: 'Past Far' }      // -4 days
    ] as any[];
    // Expected distances:
    // Future Far: 5 days
    // Future Near: 1 day
    // Past Near: 1 day
    // Past Far: 4 days
    // Sorted order should be: [Future Near, Past Near] (in any order of these two), Past Far, Future Far

    // Update the mock to return our test events
    agendaServiceMock.getAgenda4targetedClassesOnrealtime.and.callFake((cb: any) => {
      cb(events);
      return () => { };
    });

    component.targetedClasses.set(['class1']);
    fixture.detectChanges();

    const sortedEvents = component.agenda();
    expect(sortedEvents.length).toBe(4);

    // Check first two (distance ~1 day)
    const firstTwoTitles = [sortedEvents[0].title, sortedEvents[1].title];
    expect(firstTwoTitles).toContain('Future Near');
    expect(firstTwoTitles).toContain('Past Near');

    // Check third (distance 4 days)
    expect(sortedEvents[2].title).toBe('Past Far');

    // Check fourth (distance 5 days)
    expect(sortedEvents[3].title).toBe('Future Far');
  });

  it('should sort events chronologically in scheduler view', () => {
    component.viewMode.set('scheduler');

    // Create unsorted events
    const events = [
      { dataInizio: '2023-01-01T15:00:00Z', title: 'Afternoon' },
      { dataInizio: '2023-01-01T09:00:00Z', title: 'Morning' },
      { dataInizio: '2023-01-02T10:00:00Z', title: 'Next Day' }
    ] as any[];

    // Update mock
    agendaServiceMock.getAgenda4targetedClassesOnrealtime.and.callFake((cb: any) => {
      cb(events);
      return () => { };
    });

    component.targetedClasses.set(['class1']);
    fixture.detectChanges();

    const sortedEvents = component.agenda();
    expect(sortedEvents.length).toBe(3);
    expect(sortedEvents[0].title).toBe('Morning');
    expect(sortedEvents[1].title).toBe('Afternoon');
    expect(sortedEvents[2].title).toBe('Next Day');
  });
});
