import { Component, Input, OnInit, inject, ViewChild, ChangeDetectorRef, ChangeDetectionStrategy, signal, effect } from '@angular/core';
import { ModalController, IonDatetime, IonDatetimeButton } from '@ionic/angular/standalone';

import { FormsModule } from '@angular/forms';
import { form, schema, FormField, FormRoot, required } from '@angular/forms/signals';
import { IonicModule } from '@ionic/angular';

import { AgendaEvent, IAgendaEvent, EventType } from '../../models/agendaEvent';
import { IClasseModel } from 'src/app/pages/classes/models/classModel';
import { AgendaService } from 'src/app/shared/services/agenda.service';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { UsersService } from 'src/app/shared/services/users.service';
import { UserModel } from 'src/app/shared/models/userModel';
import { QueryCondition } from 'src/app/shared/models/queryCondition';
import { SubjectService } from 'src/app/pages/subjects-list/services/subjects/subject.service';
import { SubjectModel } from 'src/app/pages/subjects-list/models/subjectModel';

/**
 * Dialog per la creazione e modifica di eventi agenda.
 * Permette di impostare titolo, descrizione, date, tipo e classe di destinazione.
 */
@Component({
  selector: 'app-event-dialog',
  templateUrl: './event-dialog.component.html',
  styleUrls: ['./event-dialog.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, IonicModule, FormField, FormRoot]
})
export class EventDialogComponent implements OnInit {
  /**
   * Gets the class key from a class info object
   */
  getClassKey(classInfo: IClasseModel | string): string {
    if (!classInfo) return '';
    if (typeof classInfo === 'string') return classInfo;
    return (classInfo as IClasseModel).key || (classInfo as IClasseModel).id || '';
  }

  private modalCtrl = inject(ModalController);
  private usersService = inject(UsersService);
  private subjectService = inject(SubjectService);
  private cdr = inject(ChangeDetectorRef);
  private $agenda = inject(AgendaService);
  private toaster = inject(ToasterService);

  loggedUser: UserModel | null = null;
  subjects: SubjectModel[] = [];

  students: UserModel[] = [];
  private studentsUnsubscribe?: () => void;

  static idCounter = 0;
  uniqueId: string = `evt_${Date.now()}_${EventDialogComponent.idCounter++}`;
  startDatetimeId = `start_${this.uniqueId}`;
  endDatetimeId = `end_${this.uniqueId}`;

  @ViewChild('startDatetime') startDatetime?: IonDatetime;
  @ViewChild('endDatetime') endDatetime?: IonDatetime;

  @Input() event: AgendaEvent | null = null;
  @Input() targetedClasses: IClasseModel[] = [];
  @Input() classId: string = '';
  @Input() teacherKey: string = '';

  eventModel = signal({
    title: '',
    description: '',
    dataInizio: new Date(Date.now()).toISOString(),
    dataFine: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    type: 'other',
    link: '',
    classKey: [] as string[],
    targetStudents: [] as string[],
    subjectKey: '',
    allDay: false
  });

  eventForm = form(this.eventModel, schema((s) => {
    required(s.title);
    required(s.dataInizio);
    required(s.dataFine);
    required(s.classKey);
  }));

  // Available event types
  eventTypes = [
    { value: 'homework', label: 'Compiti' },
    { value: 'test', label: 'Verifica' },
    { value: 'interrogation', label: 'Interrogazione' },
    { value: 'meeting', label: 'Riunione' },
    { value: 'online_meeting', label: 'Riunione On-line' },
    { value: 'colloquio', label: 'Colloquio' },
    { value: 'note', label: 'Nota' },
    { value: 'other', label: 'Altro' }
  ];

  // Date constraints
  minDate: string = new Date().toISOString();
  maxDate: string = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString();

  constructor() {}

  async ionViewWillEnter() {
    console.log('EventDialogComponent - ionViewWillEnter');
    this.loggedUser = await this.usersService.getLoggedUser();

    if (this.event) {
      console.log('Editing existing event:', this.event);
      let classes: string[] = [];
      if (this.event.classKey) {
        classes = Array.isArray(this.event.classKey) ? this.event.classKey : [this.event.classKey];
      } else if (this.event.targetClasses && this.event.targetClasses.length > 0) {
        classes = this.event.targetClasses.map((c: any) => typeof c === 'string' ? c : c.key);
      }

      this.eventForm().patchValue({
        title: this.event.title || '',
        description: this.event.description || '',
        dataInizio: this.event.dataInizio || new Date().toISOString(),
        dataFine: this.event.dataFine || new Date().toISOString(),
        type: this.event.type || 'other',
        link: this.event.link || '',
        classKey: classes,
        targetStudents: this.event.targetStudents || [],
        subjectKey: this.event.subjectKey || '',
        allDay: this.event.allDay || false
      });
    } else {
      // New event defaults
      if (this.classId) {
        this.eventForm().patchValue({ classKey: [this.classId] });
      }
    }
    
    this.loadStudents();
    await this.loadSubjects();
    this.cdr.markForCheck();
  }

  private loadStudents() {
    if (this.studentsUnsubscribe) {
      this.studentsUnsubscribe();
      this.studentsUnsubscribe = undefined;
    }

    const classKeys = this.eventModel().classKey;
    if (classKeys && Array.isArray(classKeys) && classKeys.length > 0) {
      this.studentsUnsubscribe = this.usersService.getUsersOnRealTime((users) => {
        this.students = users.sort((a, b) => (a.lastName || '').localeCompare(b.lastName || ''));
        
        const availableKeys = new Set(this.students.map(s => s.key));
        let targetStudents = this.eventModel().targetStudents || [];
        if (targetStudents.length > 0) {
          targetStudents = targetStudents.filter(key => availableKeys.has(key));
          this.eventForm().patchValue({ targetStudents });
        }
        this.cdr.markForCheck();
      }, [new QueryCondition('classKey', 'in', classKeys)]);
    } else {
      this.students = [];
      this.eventForm().patchValue({ targetStudents: [] });
    }
  }

  private async loadSubjects() {
    const classKeys = this.eventModel().classKey;
    if (!this.loggedUser || !this.loggedUser.assignedClasses || !classKeys || classKeys.length === 0) {
      this.subjects = [];
      if (this.eventModel().subjectKey && !this.subjects.find(s => s.key === this.eventModel().subjectKey)) {
          this.eventForm().patchValue({ subjectKey: '' });
      }
      return;
    }

    const availableSubjectKeys = new Set<string>();
    
    for (const classKey of classKeys) {
      const assignedClass = this.loggedUser.assignedClasses.find((c: any) => c.key === classKey);
      if (assignedClass && assignedClass.subjectsKey) {
        assignedClass.subjectsKey.forEach((key: string) => availableSubjectKeys.add(key));
      }
    }

    if (availableSubjectKeys.size > 0) {
      this.subjects = await this.subjectService.fetchSubjectsByKeys(Array.from(availableSubjectKeys));
    } else {
      this.subjects = [];
    }

    if (this.eventModel().subjectKey && !this.subjects.find(s => s.key === this.eventModel().subjectKey)) {
      this.eventForm().patchValue({ subjectKey: '' });
    }
    this.cdr.markForCheck();
  }

  selectAllClasses() {
    if (this.targetedClasses && this.targetedClasses.length > 0) {
      this.eventForm().patchValue({ classKey: this.targetedClasses.map(c => this.getClassKey(c)) });
      this.onFieldChange('classKey');
    }
  }

  deselectAllClasses() {
    this.eventForm().patchValue({ classKey: [] });
    this.onFieldChange('classKey');
  }

  ngOnInit() {
    this.ionViewWillEnter();
  }

  dismiss() {
    this.modalCtrl.dismiss({ saved: false });
  }

  save() {
    if (this.isFormValid()) {
      const val = this.eventForm().value();
      const targetClasses = val.classKey || [];

      const formEventData: Partial<IAgendaEvent> = {
        title: val.title?.trim() || '',
        description: val.description?.trim() || '',
        dataInizio: val.dataInizio || new Date().toISOString(),
        dataFine: val.dataFine || new Date().toISOString(),
        type: (val.type as any) || 'other',
        link: val.link || '',
        allDay: val.allDay || false,
        classKey: targetClasses,
        targetClasses,
        targetStudents: val.targetStudents || [],
        subjectKey: val.subjectKey || '',
        creationDate: this.event ? this.event.creationDate : Date.now(),
        teacherKey: this.teacherKey || (this.event ? this.event.teacherKey : '')
      };

      const eventToSave = new AgendaEvent(formEventData);

      try {
        if (this.event && (this.event.key || this.event.id)) {
          eventToSave.key = this.event.key;
          eventToSave.id = this.event.id;
          console.log("Updating event", eventToSave);

          this.$agenda.updateEvent(eventToSave);
          this.toaster.showToast({ message: "Evento aggiornato con successo", duration: 2000, position: "top" }, "success");
        } else {
          console.log("Creating new event", eventToSave);
          this.$agenda.addEvent(eventToSave);
          this.toaster.showToast({ message: "Evento aggiunto con successo", duration: 2000, position: "top" }, "success");
        }
      } catch (error) {
        console.error("Error saving event:", error);
        this.toaster.showToast({ message: "Errore durante il salvataggio", duration: 2000, position: "top" }, "danger");
      }

      this.modalCtrl.dismiss({
        saved: true,
        event: eventToSave
      });
    } else {
      this.toaster.showToast({ message: "Compila tutti i campi obbligatori", duration: 2000, position: "top" }, "warning");
    }
  }

  cancel() {
    this.modalCtrl.dismiss({ saved: false });
  }

  onAllDayChange(event: any) {
    this.eventForm().patchValue({ allDay: event.detail.checked });
    const val = this.eventModel();
    if (val.allDay && val.dataInizio) {
      const start = new Date(val.dataInizio);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(start);
      end.setHours(23, 59, 59, 999);
      
      this.eventForm().patchValue({
        dataInizio: start.toISOString(),
        dataFine: end.toISOString()
      });
    } else if (!val.allDay && val.dataInizio) {
      const start = new Date(val.dataInizio);
      start.setHours(12, 0, 0, 0);

      const end = new Date(start);
      end.setHours(13, 0, 0, 0);
      
      this.eventForm().patchValue({
        dataInizio: start.toISOString(),
        dataFine: end.toISOString()
      });
    }
  }

  onStartDateChange() {
    const val = this.eventModel();
    if (!val.dataInizio) return;

    const startDate = new Date(val.dataInizio);
    const endDate = val.dataFine ? new Date(val.dataFine) : new Date(startDate);

    if (endDate < startDate) {
      if (val.allDay) {
        const newEndDate = new Date(startDate);
        newEndDate.setDate(newEndDate.getDate() + 1);
        newEndDate.setHours(0, 0, 0, 0);
        this.eventForm().patchValue({ dataFine: newEndDate.toISOString() });
      } else {
        endDate.setTime(startDate.getTime() + 60 * 60 * 1000);
        this.eventForm().patchValue({ dataFine: endDate.toISOString() });
      }
    }
  }

  onEndDateChange() {
    const val = this.eventModel();
    if (val.dataInizio && val.dataFine) {
      const startDate = new Date(val.dataInizio);
      const endDate = new Date(val.dataFine);

      if (endDate < startDate) {
        this.eventForm().patchValue({ dataFine: val.dataInizio });
      }
    }
  }

  hasDateError(): boolean {
    const val = this.eventModel();
    if (!val.dataInizio || !val.dataFine) return false;
    let out = false;

    const startDate = new Date(val.dataInizio).getTime();
    const endDate = new Date(val.dataFine).getTime();

    if (endDate < startDate) {
      this.eventForm().patchValue({ dataFine: val.dataInizio });
      out = true;
    }
    return out;
  }

  onFieldChange(field: string): void {
    if (field === 'classKey') {
      this.loadStudents();
      this.loadSubjects();
    }
  }

  isFormValid(): boolean {
    if (!this.eventForm().valid()) return false;
    
    const val = this.eventModel();

    if (!val.title?.trim()) return false;
    if (!val.dataInizio) return false;
    if (!val.dataFine) return false;

    const start = new Date(val.dataInizio).getTime();
    const end = new Date(val.dataFine).getTime();

    if (end < start) return false;

    if (!val.classKey || val.classKey.length === 0) {
      return false;
    }

    if (val.type === 'interrogation') {
      if (!val.targetStudents || val.targetStudents.length === 0) {
        return false;
      }
      if (!val.subjectKey) {
        return false;
      }
    }

    return true;
  }
}
