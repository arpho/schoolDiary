import { Component, ChangeDetectionStrategy, input, ElementRef, ViewChild, AfterViewInit, OnDestroy, effect, signal, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import Calendar from '@toast-ui/calendar';
import { TimetableModel } from '../../models/timetable.model';
import { IonButtons, IonButton, IonIcon, IonText, IonSegment, IonSegmentButton, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronBack, chevronForward } from 'ionicons/icons';
import { FormsModule } from '@angular/forms';
import { SubjectService } from 'src/app/pages/subjects-list/services/subjects/subject.service';
import { SubjectModel } from 'src/app/pages/subjects-list/models/subjectModel';

@Component({
    selector: 'app-timetable-toast-ui',
    templateUrl: './timetable-toast-ui.component.html',
    styleUrls: ['./timetable-toast-ui.component.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, IonButtons, IonButton, IonIcon, IonText, IonSegment, IonSegmentButton, IonLabel, FormsModule]
})
export class TimetableToastUiComponent implements AfterViewInit, OnDestroy {
    @ViewChild('calendar') calendarContainer!: ElementRef;

    timetable = input.required<TimetableModel[]>();

    private calendarInstance: Calendar | null = null;
    currentDateDisplay = signal<string>('');
    currentView = signal<'day' | 'week'>('week'); // Default to week view for timetable

    private subjectService = inject(SubjectService);
    private subjectsCache = new Map<string, SubjectModel>();

    constructor() {
        addIcons({ chevronBack, chevronForward });

        effect(() => {
            const timetable = this.timetable();
            // We need to fetch subjects to display names/colors
            this.preloadSubjects(timetable).then(() => {
                if (this.calendarInstance) {
                    this.calendarInstance.clear();
                    this.calendarInstance.createEvents(this.transformEvents(timetable));
                    this.updateDateDisplay();
                }
            });
        });

        effect(() => {
            const view = this.currentView();
            if (this.calendarInstance) {
                this.calendarInstance.changeView(view);
                this.updateDateDisplay();
            }
        });
    }

    async preloadSubjects(timetable: TimetableModel[]) {
        const subjectKeys = new Set(timetable.map(t => t.subjectKey).filter(k => !!k));
        // Filter out keys we already have
        const keysToFetch = Array.from(subjectKeys).filter(key => !this.subjectsCache.has(key));

        if (keysToFetch.length > 0) {
            const subjects = await this.subjectService.fetchSubjectsByKeys(keysToFetch);
            subjects.forEach(s => this.subjectsCache.set(s.key, s));
        }
    }

    ngAfterViewInit() {
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
            defaultView: 'week',
            useFormPopup: false,
            useDetailPopup: false,
            isReadOnly: true,
            usageStatistics: false,
            calendars: [
                {
                    id: '1',
                    name: 'Timetable',
                    backgroundColor: '#9e5fff',
                }
            ],
            week: {
                taskView: false,
                eventView: ['time'],
                hourStart: 7,
                hourEnd: 22,
                dayNames: ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'],
            },
            template: {
                time(event) {
                    return `<span style="color: white; font-size: 12px;">${event.title}</span>`;
                }
            }
        });

        this.updateDateDisplay();

        // Initial render
        this.preloadSubjects(this.timetable()).then(() => {
            if (this.calendarInstance) {
                this.calendarInstance.createEvents(this.transformEvents(this.timetable()));
            }
        });
    }

    private transformEvents(timetable: TimetableModel[]): any[] {
        // Mapping day names to recurrence Day names (Monday -> MO)
        const dayMap: { [key: string]: string } = {
            'Sunday': 'SU', 'Domenica': 'SU',
            'Monday': 'MO', 'Lunedì': 'MO', 'Lunedi': 'MO',
            'Tuesday': 'TU', 'Martedì': 'TU', 'Martedi': 'TU',
            'Wednesday': 'WE', 'Mercoledì': 'WE', 'Mercoledi': 'WE',
            'Thursday': 'TH', 'Giovedì': 'TH', 'Giovedi': 'TH',
            'Friday': 'FR', 'Venerdì': 'FR', 'Venerdi': 'FR',
            'Saturday': 'SA', 'Sabato': 'SA'
        };

        // Mapping day names to JS Date day index (0=Sunday) to calculate start date
        const dayIndexMap: { [key: string]: number } = {
            'Sunday': 0, 'Domenica': 0,
            'Monday': 1, 'Lunedì': 1, 'Lunedi': 1,
            'Tuesday': 2, 'Martedì': 2, 'Martedi': 2,
            'Wednesday': 3, 'Mercoledì': 3, 'Mercoledi': 3,
            'Thursday': 4, 'Giovedì': 4, 'Giovedi': 4,
            'Friday': 5, 'Venerdì': 5, 'Venerdi': 5,
            'Saturday': 6, 'Sabato': 6
        };

        const events: any[] = [];

        // Use a reference start date for recurrence: First week of current year or arbitrary past date
        // Let's use the Monday of the current week as a base, then adjust.
        // Actually, for recurrence to work cleanly, we can set the start date to a known past date.
        // Let's use Jan 1st 2024 (which was a Monday) + offset to the correct day of that week.
        const baseDate = new Date('2024-01-01T00:00:00'); // Monday

        timetable.forEach(item => {
            const recurrenceDay = dayMap[item.day];
            const targetDayIndex = dayIndexMap[item.day];

            if (!recurrenceDay || targetDayIndex === undefined) return;

            // Calculate a start date for the event that lines up with the day
            // Jan 1 2024 is Monday (Index 1).
            // targetDayIndex - 1 gives offset from Jan 1.
            // If targetDayIndex is 0 (Sunday), offset is +6 (next Sunday) for Week starting Monday, or -1.
            // Let's just find the first occurrence of this day near Jan 1 2024.

            let startDayOffset = targetDayIndex - 1; // 1 (Mon) - 1 = 0.
            if (targetDayIndex === 0) startDayOffset = 6; // Sunday is 6 days after Monday

            const eventStartDate = new Date(baseDate);
            eventStartDate.setDate(baseDate.getDate() + startDayOffset);

            const start = this.combineDateAndTime(eventStartDate, item.startTime);
            const end = this.combineDateAndTime(eventStartDate, item.endTime);

            const subject = this.subjectsCache.get(item.subjectKey);
            const color = subject?.color || '#3788d8';
            const title = subject?.name || item.description || 'Lezione';

            // Build the HTML title
            let displayTitle = `<strong>${title}</strong>`;
            if (item.location) {
                displayTitle += `<br><span style="font-size: 0.9em;">📍 ${item.location}</span>`;
            }
            if (item.as) {
                displayTitle += `<br><span style="font-size: 0.8em; font-style: italic;">(${item.as})</span>`;
            }

            events.push({
                id: item.key,
                calendarId: '1',
                title: displayTitle,
                category: 'time',
                start: start,
                end: end,
                backgroundColor: color,
                borderColor: color,
                color: '#FFFFFF',
                isReadOnly: true,
                recurrenceRule: `FREQ=WEEKLY;BYDAY=${recurrenceDay}`
            });
        });

        return events;
    }

    private combineDateAndTime(date: Date, timeStr: string): Date {
        // timeStr e.g. "08:00"
        const [hours, minutes] = timeStr.split(':').map(Number);
        const newDate = new Date(date);
        newDate.setHours(hours, minutes, 0, 0);
        return newDate;
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
            } else {
                const startStr = new Date(start.getTime()).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
                const endStr = new Date(end.getTime()).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' });
                this.currentDateDisplay.set(`${startStr} - ${endStr}`);
            }
        }
    }
}
