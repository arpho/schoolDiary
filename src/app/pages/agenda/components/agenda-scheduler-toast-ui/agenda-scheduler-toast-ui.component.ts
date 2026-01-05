import { Component, ChangeDetectionStrategy, input, ElementRef, ViewChild, AfterViewInit, OnDestroy, effect, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import Calendar from '@toast-ui/calendar';
import { AgendaEvent } from '../../models/agendaEvent';
import { IonButtons, IonButton, IonIcon, IonText, IonSegment, IonSegmentButton, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronBack, chevronForward } from 'ionicons/icons';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-agenda-scheduler-toast-ui',
  templateUrl: './agenda-scheduler-toast-ui.component.html',
  styleUrls: ['./agenda-scheduler-toast-ui.component.scss'],
  styles: [`
    :host {
      display: block;
      height: 100%;
      min-height: 500px; /* Fallback */
    }
  `],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonButtons, IonButton, IonIcon, IonText, IonSegment, IonSegmentButton, IonLabel, FormsModule]
})
export class AgendaSchedulerToastUiComponent implements AfterViewInit, OnDestroy {
  @ViewChild('calendar') calendarContainer!: ElementRef;
  
  events = input.required<AgendaEvent[]>();
  eventClick = output<AgendaEvent>();
  
  private calendarInstance: Calendar | null = null;
  currentDateDisplay = signal<string>('');
  currentView = signal<'day' | 'week' | 'month'>('day');

  constructor() {
    addIcons({ chevronBack, chevronForward });

    effect(() => {
      const events = this.events();
      if (this.calendarInstance) {
        this.calendarInstance.clear();
        this.calendarInstance.createEvents(this.transformEvents(events));
        this.updateDateDisplay();
      }
    });

    effect(() => {
        const view = this.currentView();
        if (this.calendarInstance) {
            this.calendarInstance.changeView(view);
            this.updateDateDisplay();
        }
    });
  }

  ngAfterViewInit() {
    // Small delay to ensure container is ready and styles are applied
    setTimeout(() => {
        this.initCalendar();
    }, 100);
  }

  ngOnDestroy() {
    if (this.calendarInstance) {
      this.calendarInstance.destroy();
    }
  }

  private initCalendar() {
    if (!this.calendarContainer) return;

    this.calendarInstance = new Calendar(this.calendarContainer.nativeElement, {
      defaultView: 'day',
      useFormPopup: false,
      useDetailPopup: false,
      isReadOnly: true,
      usageStatistics: false,
      calendars: [
        {
          id: '1',
          name: 'My Calendar',
          backgroundColor: '#9e5fff',
        }
      ],
      template: {
        time(event) {
          return `<span style="color: white; padding-left: 2px;">${event.title}</span>`;
        }
      },
      week: {
        taskView: true, // Enable task view for all-day events
        eventView: ['time'],
        hourStart: 7,
        hourEnd: 22
      },
      month: {
        dayNames: ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'],
        visibleWeeksCount: 0,
      }
    });
    
    // Event click listener
    this.calendarInstance.on('clickEvent', (eventObj: any) => {
        const originalEvent = this.events().find(e => (e.id || e.key) === eventObj.event.id);
        if (originalEvent) {
             this.eventClick.emit(originalEvent);
        }
    });

    this.updateDateDisplay();

    // Force render initial events if any
    if (this.events().length > 0) {
        this.calendarInstance.createEvents(this.transformEvents(this.events()));
    } else {
        // Add a test event to verify visibility
        console.log('Adding TEST event');
        this.calendarInstance.createEvents([{
            id: 'test-event-1',
            calendarId: '1',
            title: 'TEST EVENT VISIBLE?',
            category: 'time',
            state: 'Free',
            start: new Date(),
            end: new Date(new Date().getTime() + 60 * 60 * 1000),
            backgroundColor: 'red',
            color: 'white'
        }]);
    }
  }

  private transformEvents(agendaEvents: AgendaEvent[]): any[] {
    console.log('Transforming events:', agendaEvents);
    const transformed = agendaEvents.map(e => {
        const isAllDay = e.allDay; 
        
        // Ensure dates are Date objects or valid ISO strings
        let start = e.dataInizio;
        let end = e.dataFine;

        return {
            id: e.id || e.key,
            calendarId: '1',
            title: e.title,
            category: isAllDay ? 'allday' : 'time',
            start: start,
            end: end,
            backgroundColor: this.getEventColor(e.type),
            color: '#FFFFFF',
            borderColor: this.getEventColor(e.type),
            isReadOnly: true
        };
    });
    console.log('Transformed events for Toast UI:', transformed);
    return transformed;
  }

  private getEventColor(type: string): string {
    switch(type) {
      case 'homework': return 'var(--ion-color-primary)';
      case 'test': return 'var(--ion-color-danger)';
      case 'meeting': return 'var(--ion-color-warning)';
      case 'interrogation': return 'var(--ion-color-tertiary)';
      case 'note': return 'var(--ion-color-success)';
      case 'other':
      default: return 'var(--ion-color-medium)';
    }
  }

  onViewChange(event: any) {
    this.currentView.set(event.detail.value);
  }

  next() {
    this.calendarInstance?.next();
    this.updateDateDisplay();
  }

  prev() {
    this.calendarInstance?.prev();
    this.updateDateDisplay();
  }

  today() {
    this.calendarInstance?.today();
    this.updateDateDisplay();
  }

  private updateDateDisplay() {
    if (this.calendarInstance) {
      const date = this.calendarInstance.getDate();
      const start = this.calendarInstance.getDateRangeStart();
      const end = this.calendarInstance.getDateRangeEnd();

      if (this.currentView() === 'day') {
        this.currentDateDisplay.set(new Date(date.getTime()).toLocaleDateString('it-IT', { 
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
        }));
      } else if (this.currentView() === 'week') {
         const startStr = new Date(start.getTime()).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
         const endStr = new Date(end.getTime()).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' });
         this.currentDateDisplay.set(`${startStr} - ${endStr}`);
      } else {
         this.currentDateDisplay.set(new Date(date.getTime()).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' }));
      }
    }
  }
}
