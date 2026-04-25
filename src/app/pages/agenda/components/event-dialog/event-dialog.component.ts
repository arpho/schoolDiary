import { Component, Input, OnInit, inject, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ModalController, IonDatetime, IonDatetimeButton } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
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

// Estendi il tipo AgendaEvent per gestire i targetClasses come stringhe o oggetti ClasseModel
type ExtendedAgendaEvent = Omit<IAgendaEvent, 'targetClasses'> & {
  targetClasses?: (string | IClasseModel)[];
};

/**
 * Dialog per la creazione e modifica di eventi agenda.
 * Permette di impostare titolo, descrizione, date, tipo e classe di destinazione.
 */
@Component({
  selector: 'app-event-dialog',
  templateUrl: './event-dialog.component.html',
  styleUrls: ['./event-dialog.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class EventDialogComponent implements OnInit {
  /**
   * Gets the class key from a class info object
   * @param classInfo The class info object or string
   * @returns The class key as string
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

  loggedUser: UserModel | null = null;
  subjects: SubjectModel[] = [];

  students: UserModel[] = [];
  private studentsUnsubscribe?: () => void;

  // Input properties
  @ViewChild('eventForm') eventForm?: NgForm;
  @ViewChild('startDatetime') startDatetime?: IonDatetime;
  @ViewChild('endDatetime') endDatetime?: IonDatetime;

  @Input() event: AgendaEvent | null = null;
  @Input() targetedClasses: IClasseModel[] = [];
  @Input() classId: string = '';
  @Input() teacherKey: string = '';

  // Form model
  eventData: Partial<ExtendedAgendaEvent> = {
    title: '',
    description: '',
    dataInizio: new Date(Date.now()).toISOString(),
    dataFine: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 ora dopo
    type: 'other',
    classKey: this.classId ? [this.classId] : [],
    targetStudents: [],
    teacherKey: this.teacherKey,
    allDay: false
  };

  // Available event types
  eventTypes = [
    { value: 'homework', label: 'Compiti' },
    { value: 'test', label: 'Verifica' },
    { value: 'interrogation', label: 'Interrogazione' },
    { value: 'meeting', label: 'Riunione' },
    { value: 'colloquio', label: 'Colloquio' },
    { value: 'note', label: 'Nota' },
    { value: 'other', label: 'Altro' }
  ];

  // Date constraints - using ISO strings for min/max dates
  minDate: string = new Date().toISOString();
  maxDate: string = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString();

  constructor(
    private $agenda: AgendaService,
    private toaster: ToasterService
  ) { }

  async ionViewWillEnter() {
    console.log('EventDialogComponent - ionViewWillEnter');
    this.loggedUser = await this.usersService.getLoggedUser();

    if (this.event) {
      console.log('Editing existing event:', this.event);
      // Populate form with existing event data
      this.eventData = { ...this.event };
      // Handle classKey migration if needed
      if (this.event.classKey) {
        this.eventData.classKey = Array.isArray(this.event.classKey) ? this.event.classKey : [this.event.classKey];
      } else if (this.event.targetClasses && this.event.targetClasses.length > 0) {
        this.eventData.classKey = this.event.targetClasses.map(c => typeof c === 'string' ? c : (c as any).key);
      }
    } else {
      // New event defaults
      if (this.classId) {
        this.eventData.classKey = [this.classId];
      }
      if (this.teacherKey) {
        this.eventData.teacherKey = this.teacherKey;
      }
    }
    
    this.loadStudents();
    await this.loadSubjects();
  }

  private loadStudents() {
    if (this.studentsUnsubscribe) {
      this.studentsUnsubscribe();
      this.studentsUnsubscribe = undefined;
    }

    const classKeys = this.eventData.classKey;
    if (classKeys && Array.isArray(classKeys) && classKeys.length > 0) {
      this.studentsUnsubscribe = this.usersService.getUsersOnRealTime((users) => {
        this.students = users.sort((a, b) => (a.lastName || '').localeCompare(b.lastName || ''));
        
        const availableKeys = new Set(this.students.map(s => s.key));
        if (this.eventData.targetStudents) {
          this.eventData.targetStudents = this.eventData.targetStudents.filter(key => availableKeys.has(key));
        } else {
          this.eventData.targetStudents = [];
        }
        this.cdr.detectChanges();
      }, [new QueryCondition('classKey', 'in', classKeys)]);
    } else {
      this.students = [];
      this.eventData.targetStudents = [];
    }
  }

  private async loadSubjects() {
    if (!this.loggedUser || !this.loggedUser.assignedClasses || !this.eventData.classKey || this.eventData.classKey.length === 0) {
      this.subjects = [];
      if (this.eventData.subjectKey && !this.subjects.find(s => s.key === this.eventData.subjectKey)) {
          this.eventData.subjectKey = '';
      }
      return;
    }

    const availableSubjectKeys = new Set<string>();
    const classKeys = Array.isArray(this.eventData.classKey) ? this.eventData.classKey : [this.eventData.classKey];
    
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

    // Se la materia selezionata non è più disponibile, resettala
    if (this.eventData.subjectKey && !this.subjects.find(s => s.key === this.eventData.subjectKey)) {
      this.eventData.subjectKey = '';
    }
  }

  /**
   * Seleziona tutte le classi disponibili nella lista targetedClasses.
   */
  selectAllClasses() {
    if (this.targetedClasses && this.targetedClasses.length > 0) {
      this.eventData.classKey = this.targetedClasses.map(c => this.getClassKey(c));
      this.onFieldChange('classKey');
    }
  }

  /**
   * Deseleziona tutte le classi.
   */
  deselectAllClasses() {
    this.eventData.classKey = [];
    this.onFieldChange('classKey');
  }

  // Manteniamo ngOnInit per compatibilità
  ngOnInit() {
    this.ionViewWillEnter();
  }

  // Dismiss the modal without saving
  dismiss() {
    this.modalCtrl.dismiss({ saved: false });
  }

  // Save the event and close the modal
  /**
   * Salva l'evento (creazione o aggiornamento) se il form è valido.
   * Chiude il modale restituendo l'evento salvato.
   */
  save() {
    if (this.isFormValid()) {
      // Create targetClasses array from the selected classKey
      const targetClasses = Array.isArray(this.eventData.classKey) ? this.eventData.classKey : (this.eventData.classKey ? [this.eventData.classKey] : []);

      // Create the event data with proper types
      const formEventData: Partial<IAgendaEvent> = {
        ...this.eventData,
        title: this.eventData.title?.trim() || '',
        description: this.eventData.description?.trim() || '',
        dataInizio: this.eventData.dataInizio || new Date().toISOString(),
        dataFine: this.eventData.dataFine || new Date().toISOString(),
        type: this.eventData.type || 'other',
        allDay: this.eventData.allDay || false,
        targetClasses,
        targetStudents: this.eventData.targetStudents || [],
        subjectKey: this.eventData.subjectKey || '',
        creationDate: this.eventData.creationDate || Date.now()
      };

      const eventToSave = new AgendaEvent(formEventData);

      try {
        if (this.event && (this.event.key || this.event.id)) {
          // UPDATE
          // Ensure ID/Key is preserved
          eventToSave.key = this.event.key;
          eventToSave.id = this.event.id;
          console.log("Updating event", eventToSave);

          this.$agenda.updateEvent(eventToSave);
          this.toaster.showToast({ message: "Evento aggiornato con successo", duration: 2000, position: "top" }, "success");
        } else {
          // CREATE
          console.log("Creating new event", eventToSave);
          this.$agenda.addEvent(eventToSave);
          this.toaster.showToast({ message: "Evento aggiunto con successo", duration: 2000, position: "top" }, "success");
        }
      } catch (error) {
        console.error("Error saving event:", error);
        this.toaster.showToast({ message: "Errore durante il salvataggio", duration: 2000, position: "top" }, "danger");
      }

      // Dismiss the modal with the saved event
      this.modalCtrl.dismiss({
        saved: true,
        event: eventToSave
      });
    } else {
      // Mark all fields as touched to show validation messages
      this.markFormGroupTouched();
    }
  }

  // Mark all form controls as touched to show validation messages
  private markFormGroupTouched() {
    if (this.eventForm) {
      Object.keys(this.eventForm.controls).forEach(field => {
        const control = this.eventForm?.controls[field];
        control?.markAsTouched();
        control?.updateValueAndValidity();
      });
    }
  }

  // Close the modal without saving
  cancel() {
    this.modalCtrl.dismiss({ saved: false });
  }

  // Handle all day toggle
  onAllDayChange(event: any) {
    this.eventData.allDay = event.detail.checked;
    if (this.eventData.allDay && this.eventData.dataInizio) {
      // Se è un evento di un giorno intero, imposta l'orario a inizio/fine giornata
      const start = new Date(this.eventData.dataInizio);
      start.setHours(0, 0, 0, 0);
      this.eventData.dataInizio = start.toISOString();

      const end = new Date(this.eventData.dataInizio);
      end.setHours(23, 59, 59, 999);
      this.eventData.dataFine = end.toISOString();
    } else if (!this.eventData.allDay && this.eventData.dataInizio) {
      // Se non è più un evento di un giorno intero, imposta un orario ragionevole
      const start = new Date(this.eventData.dataInizio);
      start.setHours(12, 0, 0, 0);
      this.eventData.dataInizio = start.toISOString();

      const end = new Date(start);
      end.setHours(13, 0, 0, 0);
      this.eventData.dataFine = end.toISOString();
    }
  }

  // Update end date when start date changes
  onStartDateChange() {
    if (!this.eventData.dataInizio) return;

    const startDate = new Date(this.eventData.dataInizio);
    const endDate = this.eventData.dataFine ? new Date(this.eventData.dataFine) : new Date(startDate);

    // Se la data di fine è precedente alla data di inizio, aggiorna la data di fine
    if (endDate < startDate) {
      if (this.eventData.allDay) {
        // Per eventi di un giorno intero, imposta la fine alla mezzanotte del giorno successivo
        const newEndDate = new Date(startDate);
        newEndDate.setDate(newEndDate.getDate() + 1);
        newEndDate.setHours(0, 0, 0, 0);
        this.eventData.dataFine = newEndDate.toISOString();
      } else {
        // Per eventi con orario, aggiungi 1 ora
        endDate.setTime(startDate.getTime() + 60 * 60 * 1000);
        this.eventData.dataFine = endDate.toISOString();
      }
    }
  }

  // Handle end date changes
  onEndDateChange() {
    // Verifica che la data di fine sia successiva a quella di inizio
    if (this.eventData.dataInizio && this.eventData.dataFine) {
      const startDate = new Date(this.eventData.dataInizio);
      const endDate = new Date(this.eventData.dataFine);

      if (endDate < startDate) {
        // Se la data di fine è precedente a quella di inizio, ripristina il valore precedente
        this.eventData.dataFine = this.eventData.dataInizio;
      }
    }
  }

  // Check if there's a date error (end date before start date)
  hasDateError(): boolean {
    if (!this.eventData.dataInizio || !this.eventData.dataFine) return false;
    let out = false;

    const startDate = new Date(this.eventData.dataInizio).getTime();
    const endDate = new Date(this.eventData.dataFine).getTime();

    if (endDate < startDate) {
      // Se la data di fine è precedente a quella di inizio, ripristina il valore precedente
      this.eventData.dataFine = this.eventData.dataInizio;
      out = true;
    }
    return out;
  }

  // Handle field changes for validation
  onFieldChange(field: string): void {
    if (field === 'classKey') {
      this.loadStudents();
      this.loadSubjects();
    }
    if (this.eventForm) {
      const control = this.eventForm.controls[field];
      if (control) {
        control.markAsTouched();
        control.updateValueAndValidity();
      }
    }
  }

  // Validate form
  /**
   * Valida programmaticamente i campi del form.
   * @returns True se i dati sono validi.
   */
  isFormValid(): boolean {
    // Check required fields
    if (!this.eventData.title?.trim()) return false;
    if (!this.eventData.dataInizio) return false;
    if (!this.eventData.dataFine) return false;

    // Check if end date is after or equal to start date
    const start = new Date(this.eventData.dataInizio).getTime();
    const end = new Date(this.eventData.dataFine).getTime();

    if (end < start) return false;

    // Check if at least one class is selected
    if (!this.eventData.classKey || (Array.isArray(this.eventData.classKey) && this.eventData.classKey.length === 0)) {
      return false;
    }

    // Check if targetStudents is selected when type is interrogation
    if (this.eventData.type === 'interrogation') {
      if (!this.eventData.targetStudents || this.eventData.targetStudents.length === 0) {
        return false;
      }
      if (!this.eventData.subjectKey) {
        return false;
      }
    }

    return true;
  }
}
