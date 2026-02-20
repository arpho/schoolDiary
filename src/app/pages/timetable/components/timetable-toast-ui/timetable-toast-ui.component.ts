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
import { ClassiService } from 'src/app/pages/classes/services/classi.service';
import { ClasseModel } from 'src/app/pages/classes/models/classModel';

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
    eventClick = output<TimetableModel>();

    private calendarInstance: Calendar | null = null;
    currentDateDisplay = signal<string>('');
    currentView = signal<'day' | 'week'>('week'); // Default to week view for timetable

    private subjectService = inject(SubjectService);
    private classiService = inject(ClassiService);
    private subjectsCache = new Map<string, SubjectModel>();
    private classesCache = new Map<string, ClasseModel>();

    constructor() {
        addIcons({ chevronBack, chevronForward });

        effect(() => {
            const timetable = this.timetable();
            // We need to fetch subjects to display names/colors
            this.preloadData(timetable).then(() => {
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

    async preloadData(timetable: TimetableModel[]) {
        const subjectKeys = new Set(timetable.map(t => t.subjectKey).filter(k => !!k));
        const classKeys = new Set(timetable.map(t => t.classKey).filter(k => !!k));
        
        // Filter out keys we already have
        const subjectsToFetch = Array.from(subjectKeys).filter(key => !this.subjectsCache.has(key));
        const classesToFetch = Array.from(classKeys).filter(key => !this.classesCache.has(key));

        if (subjectsToFetch.length > 0) {
            const subjects = await this.subjectService.fetchSubjectsByKeys(subjectsToFetch);
            subjects.forEach(s => this.subjectsCache.set(s.key, s));
        }
        
        if (classesToFetch.length > 0) {
            const classes = await this.classiService.fetchClasses(classesToFetch);
            classes.forEach(c => this.classesCache.set(c.key, c));
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
                    return `<div style="color: ${event.color || 'white'}; font-size: 12px; height: 100%; display: flex; align-items: center; justify-content: center; text-align: center;">${event.title}</div>`;
                }
            }
        });

        this.calendarInstance.on('clickEvent', (eventObj: any) => {
            const originalEvent = this.timetable().find(t => t.key === eventObj.event.id);
            if (originalEvent) {
                this.eventClick.emit(originalEvent);
            }
        });

        this.updateDateDisplay();
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

        const now = new Date();
        const currentDayOfWeek = now.getDay() === 0 ? 7 : now.getDay(); // 1 = Monday, 7 = Sunday
        const monday = new Date(now);
        monday.setDate(now.getDate() - currentDayOfWeek + 1);
        monday.setHours(0, 0, 0, 0);
        const baseDate = monday;

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
            const classe = this.classesCache.get(item.classKey);
            
            const classColor = this.getClassColor(item.classKey);
            let color = classColor || subject?.color || '#3788d8';
            let textColor = '#FFFFFF';
            
            // Override colors for specific types
            if (item.description === 'Intervallo') {
                color = '#ff9f43'; // Orange
            } else if (item.description === 'Ricevimento') {
                color = '#28c76f'; // Green
            } else if (item.description === 'Ora Buca') {
                color = '#ffffff'; // White
                textColor = '#000000'; // Black text
            }

            let title = '';
            
            if (classe) {
                title += `${classe.year} ${classe.classe}<br>`;
            }
            title += subject?.name || item.description || 'Lezione';

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
                start: start.toISOString(),
                end: end.toISOString(),
                backgroundColor: color,
                borderColor: color,
                color: textColor,
                isReadOnly: true,
                recurrenceRule: `FREQ=WEEKLY;BYDAY=${recurrenceDay}`
            });
        });

        console.log("Generated Calendar Events:", events);
        return events;
    }

    private getClassColor(classeKey?: string): string | undefined {
        if (!classeKey) return undefined;
        const classe = this.classesCache.get(classeKey);
        if (!classe) return undefined;
        
        let hash = 0;
        const str = classe.classe + classe.year;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const h = hash % 360;
        return `hsl(${h}, 70%, 50%)`;
    }

    private combineDateAndTime(date: Date, timeStr: string): Date {
        if (!timeStr) {
            return new Date(date);
        }
        // Handle ISO string format from ion-datetime/ion-input "2024-01-01T08:00:00"
        if (timeStr.includes('T')) {
            const parsed = new Date(timeStr);
            if (!isNaN(parsed.getTime())) {
                const newDate = new Date(date);
                newDate.setHours(parsed.getHours(), parsed.getMinutes(), 0, 0);
                return newDate;
            }
        }
        // Handle "08:00" or "08:00:00"
        const parts = timeStr.split(':');
        const hours = parts[0] ? parseInt(parts[0], 10) : 0;
        const minutes = parts[1] ? parseInt(parts[1], 10) : 0;
        
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
