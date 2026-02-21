import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimetableToastUiComponent } from './timetable-toast-ui.component';
import { SubjectService } from 'src/app/pages/subjects-list/services/subjects/subject.service';
import { ClassiService } from 'src/app/pages/classes/services/classi.service';
import { TimetableModel } from '../../models/timetable.model';
import { AgendaEvent } from '../../../agenda/models/agendaEvent';

describe('TimetableToastUiComponent - Event Transforms', () => {
  let component: TimetableToastUiComponent;
  let fixture: ComponentFixture<TimetableToastUiComponent>;
  let mockSubjectService: any;
  let mockClassiService: any;

  beforeEach(async () => {
    mockSubjectService = {
      subjectsSig: () => []
    };
    mockClassiService = {
      classesSig: () => []
    };

    await TestBed.configureTestingModule({
      imports: [TimetableToastUiComponent], // Assuming it's a standalone component
      providers: [
        { provide: SubjectService, useValue: mockSubjectService },
        { provide: ClassiService, useValue: mockClassiService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TimetableToastUiComponent);
    component = fixture.componentInstance;
    
    // Set initial input signals
    fixture.componentRef.setInput('timetable', []);
    fixture.componentRef.setInput('agendaEvents', []);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('transformEvents', () => {
    const mockTimetable: TimetableModel[] = [{
        key: 't1',
        day: 'Monday',
        startTime: '08:00',
        endTime: '09:00',
        subjectKey: 's1',
        classKey: 'c1',
        description: '',
        location: '',
        as: '',
        teacherKey: 't1',
        setKey: 'set1'
      } as unknown as TimetableModel];

    it('should set category to "allday" when view is "month"', () => {
      const result = (component as any).transformEvents(mockTimetable, 'month');
      expect(result.length).toBe(1);
      expect(result[0].category).toBe('allday');
    });

    it('should set category to "time" when view is "week"', () => {
      const result = (component as any).transformEvents(mockTimetable, 'week');
      expect(result.length).toBe(1);
      expect(result[0].category).toBe('time');
    });

    it('should apply specific colors based on description', () => {
      const breakEvent: TimetableModel[] = [{
        key: 't2', day: 'Tuesday', startTime: '10:00', endTime: '10:15',
        subjectKey: 's2', classKey: 'c2', description: 'Intervallo', location: '', as: '',
        teacherKey: 't2', setKey: 'set2'
      } as unknown as TimetableModel];
      const result = (component as any).transformEvents(breakEvent, 'week');
      expect(result.length).toBe(1);
      expect(result[0].backgroundColor).toBe('#ff9f43'); // Orange for Intervallo
    });
  });

  describe('transformAgendaEvents', () => {
    const mockAgendaEvent: AgendaEvent = {
        id: 'a1',
        key: 'a1',
        title: 'Meeting',
        dataInizio: '2024-01-01T09:00:00',
        dataFine: '2024-01-01T10:00:00',
        type: 'meeting',
        allDay: false,
        classKey: 'c1',
        description: 'Team meeting',
        done: false,
        teacherKey: 't1',
        targetClasses: [],
        creationDate: Date.now()
    } as unknown as AgendaEvent;

    it('should set category to "allday" for all events when view is "month"', () => {
      fixture.componentRef.setInput('timetable', []); // No overlapping timetable
      const result = (component as any).transformAgendaEvents([mockAgendaEvent], 'month');
      expect(result.length).toBe(1);
      expect(result[0].category).toBe('allday');
    });

    it('should set category to "time" when view is "week" and event is not allDay', () => {
      fixture.componentRef.setInput('timetable', []); 
      const result = (component as any).transformAgendaEvents([mockAgendaEvent], 'week');
      expect(result.length).toBe(1);
      expect(result[0].category).toBe('time');
    });

    it('should filter out agenda events embedded within corresponding timetable slots', () => {
        // Monday is Jan 1 2024. Let's make the agenda event on a Monday. 
        // We will mock the timetable to have a slot on Monday at the same time and class.
        const embeddedAgendaEvent: AgendaEvent = {
            ...mockAgendaEvent,
            dataInizio: '2024-01-01T08:30:00', // Matches Monday (08:00 - 09:00 slot)
        } as unknown as AgendaEvent;
        
        fixture.componentRef.setInput('timetable', [{
            key: 't1',
            day: 'Monday', // Matches 2024-01-01 (Monday)
            startTime: '08:00',
            endTime: '09:00',
            subjectKey: 's1',
            classKey: 'c1', // Matches the agenda event class
            description: '', location: '', as: '', teacherKey: 't1', setKey: 'set1'
        } as unknown as TimetableModel]);

        const result = (component as any).transformAgendaEvents([embeddedAgendaEvent], 'week');
        
        // Should be embedded (skipped)
        expect(result.length).toBe(0);
    });

    it('should NOT filter out agenda events if classKey does not match', () => {
        const agendaEventDiffClass: AgendaEvent = {
            ...mockAgendaEvent,
            dataInizio: '2024-01-01T08:30:00',
            classKey: 'c2' // Different class
        } as unknown as AgendaEvent;
        
        fixture.componentRef.setInput('timetable', [{
            key: 't1',
            day: 'Monday',
            startTime: '08:00',
            endTime: '09:00',
            subjectKey: 's1',
            classKey: 'c1',
            description: '', location: '', as: '', teacherKey: 't1', setKey: 'set1'
        } as unknown as TimetableModel]);

        const result = (component as any).transformAgendaEvents([agendaEventDiffClass], 'week');
        
        // Should NOT be embedded
        expect(result.length).toBe(1);
    });
  });
});
