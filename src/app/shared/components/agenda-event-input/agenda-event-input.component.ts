import { Component, Input, inject, ChangeDetectorRef } from '@angular/core';
import { EventType } from '../../../pages/agenda/models/agendaEvent';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonDatetime,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonButtons,
  ModalController,
  IonDatetimeButton,
  IonModal,
  IonToggle,
  IonIcon,
  IonNote,
  IonText,
  IonAccordion,
  IonAccordionGroup
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, timeOutline } from 'ionicons/icons';
import { AgendaEvent } from '../../../pages/agenda/models/agendaEvent';
import { AgendaService } from '../../services/agenda.service';
import { ClassiService } from '../../../pages/classes/services/classi.service';
import { ClasseModel } from '../../../pages/classes/models/classModel';
import { UsersService } from '../../services/users.service';
import { UserModel } from '../../models/userModel';
import { QueryCondition } from '../../models/queryCondition';
import { SubjectModel } from '../../../pages/subjects-list/models/subjectModel';
import { SubjectService } from '../../../pages/subjects-list/services/subjects/subject.service';

/**
 * Componente (Modale) per l'inserimento e la modifica di eventi agenda.
 * Include validazione del form e gestione delle date.
 */
@Component({
  selector: 'app-agenda-event-input',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ event ? 'Modifica Evento' : 'Nuovo Evento' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">Annulla</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-item [class.ion-invalid]="showErrors && validationErrors['title']" data-field="title">
        <ion-label position="stacked">Titolo <ion-text color="danger">*</ion-text></ion-label>
        <ion-input 
          [(ngModel)]="title" 
          placeholder="Es. Compiti di matematica"
          [class.ion-invalid]="showErrors && validationErrors['title']"
          (ionInput)="clearError('title')">
        </ion-input>
        @if (showErrors && validationErrors['title']) {
          <ion-note slot="error" color="danger">
            {{ validationErrors['title'] }}
          </ion-note>
        }
      </ion-item>
      
      <ion-item>
        <ion-label position="stacked">Descrizione</ion-label>
        <ion-textarea [(ngModel)]="description" placeholder="Dettagli..."></ion-textarea>
      </ion-item>

      <ion-item>
        <ion-label>Tutto il giorno</ion-label>
        <ion-toggle [(ngModel)]="allDay" (ionChange)="onAllDayChange()"></ion-toggle>
      </ion-item>

      <ion-accordion-group class="ion-margin-bottom">
        <ion-accordion value="start" [class.accordion-invalid]="showErrors && validationErrors['dataInizio']">
          <ion-item slot="header">
            <ion-label>
              <h2>Data inizio <ion-text color="danger">*</ion-text></h2>
              <p>{{ dataInizio | date: (allDay ? 'dd MMM yyyy' : 'dd MMM yyyy HH:mm') }}</p>
            </ion-label>
          </ion-item>
          <div slot="content" class="ion-no-padding">
            <ion-datetime 
              [(ngModel)]="dataInizio" 
              [presentation]="allDay ? 'date' : 'date-time'" 
              (ionChange)="onStartDateChange($event)"
              size="cover"
              [preferWheel]="true">
            </ion-datetime>
          </div>
        </ion-accordion>

        <ion-accordion value="end" [class.accordion-invalid]="showErrors && validationErrors['dataFine']">
          <ion-item slot="header">
            <ion-label>
              <h2>Data fine <ion-text color="danger">*</ion-text></h2>
              <p>{{ dataFine | date: (allDay ? 'dd MMM yyyy' : 'dd MMM yyyy HH:mm') }}</p>
            </ion-label>
          </ion-item>
          <div slot="content" class="ion-no-padding">
            <ion-datetime 
              [(ngModel)]="dataFine" 
              [presentation]="allDay ? 'date' : 'date-time'" 
              (ionChange)="onEndDateChange($event)"
              size="cover"
              [preferWheel]="true">
            </ion-datetime>
          </div>
        </ion-accordion>
      </ion-accordion-group>

      @if (showErrors && (validationErrors['dataInizio'] || validationErrors['dataFine'])) {
        <ion-note color="danger" class="ion-margin-horizontal ion-margin-bottom display-block">
          {{ validationErrors['dataInizio'] || validationErrors['dataFine'] }}
        </ion-note>
      }

      <ion-item [class.ion-invalid]="showErrors && validationErrors['type']" data-field="type">
        <ion-label>Tipo evento <ion-text color="danger">*</ion-text></ion-label>
        <ion-select 
          [(ngModel)]="type" 
          placeholder="Seleziona tipo"
          [class.ion-invalid]="showErrors && validationErrors['type']"
          (ionChange)="clearError('type')">
          <ion-select-option value="homework">Compiti</ion-select-option>
          <ion-select-option value="test">Verifica</ion-select-option>
          <ion-select-option value="interrogation">Interrogazione</ion-select-option>
          <ion-select-option value="note">Nota</ion-select-option>
          <ion-select-option value="meeting">Riunione</ion-select-option>
          <ion-select-option value="colloquio">Colloquio</ion-select-option>
          <ion-select-option value="other">Altro</ion-select-option>
        </ion-select>
        @if (showErrors && validationErrors['type']) {
          <ion-note slot="error" color="danger">
            {{ validationErrors['type'] }}
          </ion-note>
        }
      </ion-item>


      <ion-item lines="none" class="ion-no-margin ion-no-padding">
        <ion-label slot="start" class="ion-margin-horizontal">Classi <ion-text color="danger">*</ion-text></ion-label>
        <ion-buttons slot="end" class="ion-margin-horizontal">
          <ion-button (click)="selectAllClasses()" color="primary" fill="clear" size="small">
            Tutte
          </ion-button>
          <ion-button (click)="deselectAllClasses()" color="medium" fill="clear" size="small">
            Nessuna
          </ion-button>
        </ion-buttons>
      </ion-item>

      <ion-item [class.ion-invalid]="showErrors && validationErrors['classKey']" data-field="classKey">
        <ion-select 
          [(ngModel)]="selectedClassKey" 
          placeholder="Seleziona classi"
          [class.ion-invalid]="showErrors && validationErrors['classKey']"
          [multiple]="true"
          (ionChange)="onClassChange(true)">
          @for (classe of classes; track classe.key) {
            <ion-select-option [value]="classe.key">
              {{ classe.classe }} - {{ classe.year }}
            </ion-select-option>
          }
        </ion-select>
        @if (showErrors && validationErrors['classKey']) {
          <ion-note slot="error" color="danger">
            {{ validationErrors['classKey'] }}
          </ion-note>
        }
      </ion-item>

      @if (type === 'interrogation') {
        <ion-item [class.ion-invalid]="showErrors && validationErrors['subjectKey']" data-field="subjectKey">
          <ion-label>Materia <ion-text color="danger">*</ion-text></ion-label>
          <ion-select 
            [(ngModel)]="subjectKey" 
            placeholder="Seleziona materia"
            [class.ion-invalid]="showErrors && validationErrors['subjectKey']"
            (ionChange)="clearError('subjectKey')">
            @for (subject of subjects; track subject.key) {
              <ion-select-option [value]="subject.key">
                {{ subject.name }}
              </ion-select-option>
            }
          </ion-select>
          @if (showErrors && validationErrors['subjectKey']) {
            <ion-note slot="error" color="danger">
              {{ validationErrors['subjectKey'] }}
            </ion-note>
          }
        </ion-item>

        <ion-item [class.ion-invalid]="showErrors && validationErrors['selectedStudentKeys']" data-field="selectedStudentKeys">
          <ion-label>Studenti da interrogare <ion-text color="danger">*</ion-text></ion-label>
          <ion-select 
            [(ngModel)]="selectedStudentKeys" 
            placeholder="Seleziona studenti"
            [multiple]="true"
            [class.ion-invalid]="showErrors && validationErrors['selectedStudentKeys']"
            (ionChange)="clearError('selectedStudentKeys')">
            @for (student of students; track student.key) {
              <ion-select-option [value]="student.key">
                {{ student.lastName }} {{ student.firstName }}
              </ion-select-option>
            }
          </ion-select>
          @if (showErrors && validationErrors['selectedStudentKeys']) {
            <ion-note slot="error" color="danger">
              {{ validationErrors['selectedStudentKeys'] }}
            </ion-note>
          }
        </ion-item>
      }

      <ion-button expand="block" class="ion-margin-top" (click)="save()" [disabled]="!validateForm().isValid">
        <ion-icon slot="start" name="save"></ion-icon>
        Salva
      </ion-button>

      <!-- Area errori -->
      @if (showErrors && getErrorKeys().length > 0) {
        <div class="error-container ion-margin-top">
          <ion-text color="danger">
            <h4>Si sono verificati i seguenti errori:</h4>
            <ul class="error-list">
              @for (key of getErrorKeys(); track key) {
                <li>
                  <ion-icon name="warning" color="danger"></ion-icon> {{ validationErrors[key] }}
                </li>
              }
            </ul>
          </ion-text>
        </div>
      }
    </ion-content>
  `,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonDatetime,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonButtons,
    IonDatetimeButton,
    IonModal,
    IonToggle,
    IonIcon,
    IonNote,
    IonText,
    IonAccordion,
    IonAccordionGroup
  ] as any[],
  styles: [`
    .time-icon {
      margin-right: 8px;
    }
    
    ion-note {
      display: block;
      margin-top: 5px;
      font-size: 0.9em;
    }
    
    ion-item.ion-invalid {
      --highlight-color-focused: var(--ion-color-danger);
      --highlight-color-valid: var(--ion-color-danger);
    }
    
    ion-input.ion-invalid,
    ion-select.ion-invalid {
      --highlight-color: var(--ion-color-danger);
      --highlight-color-focused: var(--ion-color-danger);
    }
    
    .error-container {
      background-color: var(--ion-color-light);
      border-left: 4px solid var(--ion-color-danger);
      padding: 12px;
      margin: 16px 0;
      border-radius: 4px;
    }
    
    .error-list {
      margin: 8px 0 0 0;
      padding-left: 24px;
    }
    
    .error-list li {
      margin: 8px 0;
      display: flex;
      align-items: center;
    }
    
    .error-list ion-icon {
      margin-right: 8px;
    }

    ion-accordion {
      border: 1px solid var(--ion-color-light-shade);
      border-radius: 8px;
      margin-bottom: 8px;
      background: var(--ion-item-background, var(--ion-background-color, #fff));
    }

    ion-accordion.accordion-invalid {
      border-color: var(--ion-color-danger);
    }

    ion-accordion h2 {
      font-size: 1rem;
      margin-top: 4px;
      margin-bottom: 4px;
      color: var(--ion-color-step-700);
    }

    ion-accordion p {
      font-size: 1.1rem;
      font-weight: 500;
      color: var(--ion-color-primary);
      margin: 0;
    }

    .display-block {
      display: block;
    }
  `]
})
export class AgendaEventInputComponent {
  /** Evento esistente da modificare (opzionale) */
  @Input() event?: AgendaEvent;
  /** Chiave della classe preselezionata */
  @Input() classKey: string[] | string = [];
  /** Chiave del docente creatore */
  @Input() teacherKey: string = '';
  /** Tipo di evento predefinito */
  @Input() defaultType?: EventType;
  /** Studenti preselezionati */
  @Input() defaultTargetStudents?: string[];
  /** Materia preselezionata */
  @Input() defaultSubjectKey?: string;
  /** Titolo preselezionato */
  @Input() defaultTitle?: string;
  /** Lista studenti precaricata */
  @Input() preloadedStudents?: UserModel[];
  /** Lista materie precaricata */
  @Input() preloadedSubjects?: SubjectModel[];

  validationErrors: { [key: string]: string } = {};
  showErrors = false;

  private modalCtrl = inject(ModalController);
  private agendaService = inject(AgendaService);
  private classiService = inject(ClassiService);
  private usersService = inject(UsersService);
  private subjectService = inject(SubjectService);
  private cdr = inject(ChangeDetectorRef);

  loggedUser: UserModel | null = null;
  subjects: SubjectModel[] = [];
  subjectKey: string = '';

  // Lista delle classi disponibili
  classes: ClasseModel[] = [];
  selectedClassKey: string[] = [];

  // Lista degli studenti disponibili
  students: UserModel[] = [];
  selectedStudentKeys: string[] = [];
  private studentsUnsubscribe?: () => void;

  title = '';
  description = '';
  dataInizio = this.toLocalISOString(new Date());
  dataFine = this.toLocalISOString(new Date(Date.now() + 60 * 60 * 1000)); // 1 ora dopo
  allDay = false;
  type: EventType = 'homework';
  done = false;
  id?: string;
  minDate = this.toLocalISOString(new Date());
  maxDate = this.toLocalISOString(new Date(new Date().setFullYear(new Date().getFullYear() + 1)));

  private toLocalISOString(date: Date): string {
    const tzoffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzoffset).toISOString().slice(0, -1);
  }

  /**
   * Inizializzazione del componente.
   * Carica la lista delle classi in tempo reale e popola i campi se si sta modificando un evento.
   */
  async ngOnInit() {
    this.loggedUser = await this.usersService.getLoggedUser();

    addIcons({ calendarOutline, timeOutline });

    // Se stiamo modificando un evento esistente, popola TUTTI i campi
    if (this.event) {
      console.log('Editing event:', this.event);
      this.title = this.event.title || '';
      this.description = this.event.description || '';
      this.dataInizio = this.event.dataInizio || this.toLocalISOString(new Date());
      this.dataFine = this.event.dataFine || this.toLocalISOString(new Date(Date.now() + 60 * 60 * 1000));
      this.allDay = this.event.allDay || false;
      this.type = this.event.type || 'homework';
      this.done = this.event.done || false;
      this.id = this.event.id || undefined;

      // Inizializza le classi target
      if (this.event.targetClasses && this.event.targetClasses.length > 0) {
        this.selectedClassKey = [...this.event.targetClasses];
      } else if (this.event.classKey) {
        this.selectedClassKey = Array.isArray(this.event.classKey) ? [...this.event.classKey] : [this.event.classKey];
      }

      if (this.event.targetStudents && this.event.targetStudents.length > 0) {
        this.selectedStudentKeys = [...this.event.targetStudents];
      }

      if (this.event.subjectKey) {
        this.subjectKey = this.event.subjectKey;
      }

      if (this.event.teacherKey && !this.teacherKey) {
        this.teacherKey = this.event.teacherKey;
      }
    } else {
      if (this.classKey && (!Array.isArray(this.classKey) || this.classKey.length > 0)) {
        this.selectedClassKey = Array.isArray(this.classKey) ? [...this.classKey] : [this.classKey];
      }
      if (this.defaultType) {
        this.type = this.defaultType;
      }
      if (this.defaultTargetStudents && this.defaultTargetStudents.length > 0) {
        this.selectedStudentKeys = [...this.defaultTargetStudents];
      }
      if (this.defaultSubjectKey) {
        this.subjectKey = this.defaultSubjectKey;
      }
      if (this.defaultTitle) {
        this.title = this.defaultTitle;
      }
    }

    this.classKey = [...this.selectedClassKey];
    this.loadStudents();
    await this.loadSubjects();

    // Carica la lista delle classi
    try {
      const subscription = this.classiService.getClassiOnRealtime().subscribe(classes => {
        this.classes = classes;
      });
    } catch (error) {
      console.error('Errore nel caricamento delle classi:', error);
    }

    // Validate form on initialization
    this.updateValidation();
  }

  // ...

  /**
   * Gestisce il cambio del toggle "Tutto il giorno".
   * Aggiusta automaticamente le date di inizio e fine per coprire l'intera giornata o un'ora di default.
   */
  onAllDayChange() {
    if (this.allDay) {
      // Se si passa a "Tutto il giorno", imposta l'ora a mezzanotte
      const startDate = new Date(this.dataInizio);
      startDate.setHours(0, 0, 0, 0);
      this.dataInizio = this.toLocalISOString(startDate);

      const endDate = new Date(this.dataFine);
      endDate.setHours(23, 59, 59, 999);
      this.dataFine = this.toLocalISOString(endDate);
    } else {
      // Se non è tutto il giorno, impostiamo un orario di default (es. 1 ora dopo)
      const startDate = new Date(this.dataInizio);
      startDate.setHours(12, 0, 0, 0); // Mezzogiorno
      this.dataInizio = this.toLocalISOString(startDate);

      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 ora dopo
      this.dataFine = this.toLocalISOString(endDate);
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  /**
   * Valida i campi del form.
   * Controlla obbligatorietà e coerenza delle date.
   * @returns Oggetto con flag isValid ed eventuali errori.
   */
  validateForm(): { isValid: boolean; errors: { [key: string]: string } } {
    const errors: { [key: string]: string } = {};

    if (!this.selectedClassKey || this.selectedClassKey.length === 0) {
      errors['classKey'] = 'Seleziona almeno una classe';
    }

    if (!this.title?.trim()) {
      errors['title'] = 'Il titolo è obbligatorio';
    }

    if (!this.dataInizio) {
      errors['dataInizio'] = 'La data di inizio è obbligatoria';
    }

    if (!this.dataFine) {
      errors['dataFine'] = 'La data di fine è obbligatoria';
    } else if (this.dataInizio && new Date(this.dataInizio) > new Date(this.dataFine)) {
      errors['dataFine'] = 'La data di fine non può essere precedente alla data di inizio';
    }

    if (!this.type) {
      errors['type'] = 'Il tipo di evento è obbligatorio';
    } else if (this.type === 'interrogation') {
      if (!this.selectedStudentKeys || this.selectedStudentKeys.length === 0) {
        errors['selectedStudentKeys'] = 'Seleziona almeno uno studente per l\'interrogazione';
      }
      if (!this.subjectKey) {
        errors['subjectKey'] = 'La materia è obbligatoria per le interrogazioni';
      }
    }

    if (!this.selectedClassKey || this.selectedClassKey.length === 0) {
      errors['classKey'] = 'Seleziona almeno una classe';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  private showErrorMessages(errors: { [key: string]: string }) {
    this.validationErrors = errors;
    this.showErrors = true;

    // Scroll al primo campo con errore
    const firstError = Object.keys(errors)[0];
    if (firstError) {
      const element = document.querySelector(`[data-field="${firstError}"]`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // Gestisce il cambio della data di inizio
  onStartDateChange(event: any) {
    this.dataInizio = event.detail.value;
    this.clearError('dataInizio');

    // Se la data di fine è precedente alla nuova data di inizio, aggiorniamo anche quella
    if (this.dataInizio && this.dataFine && new Date(this.dataInizio) > new Date(this.dataFine)) {
      const newEndDate = new Date(this.dataInizio);
      newEndDate.setHours(newEndDate.getHours() + 1); // Aggiungi 1 ora
      this.dataFine = this.toLocalISOString(newEndDate);
    }

    // Update validation on change
    this.updateValidation();
  }

  // Gestisce il cambio della data di fine
  onEndDateChange(event: any) {
    this.dataFine = event.detail.value;
    this.clearError('dataFine');
    this.updateValidation();
  }

  // Gestisce il cambio della classe selezionata
  async onClassChange(userInitiated: boolean = false) {
    if (userInitiated) {
      this.preloadedStudents = undefined;
      this.preloadedSubjects = undefined;
    }
    if (this.selectedClassKey && this.selectedClassKey.length > 0) {
      this.classKey = [...this.selectedClassKey];
      this.clearError('classKey');
      this.updateValidation();
    } else {
      this.classKey = [];
      this.updateValidation();
    }
    this.loadStudents();
    await this.loadSubjects();
  }

  private async loadSubjects() {
    if (this.preloadedSubjects && this.preloadedSubjects.length > 0) {
      this.subjects = [...this.preloadedSubjects];
      if (this.subjectKey && !this.subjects.find(s => s.key === this.subjectKey)) {
          this.subjectKey = '';
      }
      return;
    }

    if (!this.loggedUser || !this.loggedUser.assignedClasses || this.selectedClassKey.length === 0) {
      this.subjects = [];
      if (!this.subjects.find(s => s.key === this.subjectKey)) {
          this.subjectKey = '';
      }
      return;
    }

    const availableSubjectKeys = new Set<string>();
    for (const classKey of this.selectedClassKey) {
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
    if (this.subjectKey && !this.subjects.find(s => s.key === this.subjectKey)) {
      this.subjectKey = '';
    }
  }

  private loadStudents() {
    if (this.preloadedStudents && this.preloadedStudents.length > 0) {
      this.students = [...this.preloadedStudents].sort((a, b) => (a.lastName || '').localeCompare(b.lastName || ''));
      const availableKeys = new Set(this.students.map(s => s.key));
      this.selectedStudentKeys = this.selectedStudentKeys.filter(key => availableKeys.has(key));
      this.cdr.detectChanges();
      return;
    }

    if (this.studentsUnsubscribe) {
      this.studentsUnsubscribe();
      this.studentsUnsubscribe = undefined;
    }

    if (this.selectedClassKey && this.selectedClassKey.length > 0) {
      this.studentsUnsubscribe = this.usersService.getUsersOnRealTime((users) => {
        // Ordiniamo per cognome
        this.students = users.sort((a, b) => (a.lastName || '').localeCompare(b.lastName || ''));
        
        // Rimuove eventuali studenti selezionati che non fanno più parte delle classi scelte
        const availableKeys = new Set(this.students.map(s => s.key));
        this.selectedStudentKeys = this.selectedStudentKeys.filter(key => availableKeys.has(key));
        this.cdr.detectChanges();
      }, [new QueryCondition('classKey', 'in', this.selectedClassKey)]);
    } else {
      this.students = [];
      this.selectedStudentKeys = [];
    }
  }

  /**
   * Seleziona tutte le classi disponibili nella lista classes.
   */
  selectAllClasses() {
    if (this.classes && this.classes.length > 0) {
      this.selectedClassKey = this.classes.map(c => c.key);
      this.onClassChange();
    }
  }

  /**
   * Deseleziona tutte le classi.
   */
  deselectAllClasses() {
    this.selectedClassKey = [];
    this.onClassChange();
  }

  // Updates validation state for the form
  private updateValidation() {
    const { errors } = this.validateForm();
    this.validationErrors = errors;
    this.showErrors = Object.keys(errors).length > 0;
  }

  // Clears error for a specific field and updates validation
  clearError(field: string) {
    if (this.validationErrors[field]) {
      delete this.validationErrors[field];
      this.showErrors = this.getErrorKeys().length > 0;
    }
    // Re-validate the form to update error states
    this.updateValidation();
  }

  // Restituisce un array con le chiavi degli errori
  getErrorKeys(): string[] {
    return Object.keys(this.validationErrors).filter(key => this.validationErrors[key]);
  }



  /**
   * Salva l'evento su Firebase.
   * Crea un nuovo evento o ne aggiorna uno esistente.
   * Chiude il modale restituendo l'evento salvato.
   */
  async save() {
    const { isValid, errors } = this.validateForm();
    this.showErrors = !isValid;
    if (!isValid) {
      this.showErrorMessages(errors);
      return;
    }

    const eventData = new AgendaEvent({
      key: this.event?.key || '',
      id: this.id || this.event?.id || '',
      title: this.title,
      description: this.description,
      dataInizio: this.dataInizio,
      dataFine: this.dataFine,
      allDay: this.allDay,
      type: this.type,
      subjectKey: this.subjectKey || '',
      classKey: [...this.selectedClassKey],
      teacherKey: this.teacherKey,
      done: this.done,
      targetClasses: [...this.selectedClassKey],
      targetStudents: [...this.selectedStudentKeys],
      creationDate: this.event?.creationDate || Date.now()
    });

    try {
      if (this.event && this.event.key) {
        await this.agendaService.updateEvent(eventData);
      } else {
        await this.agendaService.addEvent(eventData);
      }
      this.modalCtrl.dismiss(eventData, 'confirm');
    } catch (error) {
      console.error('Errore durante il salvataggio dell\'evento', error);
    }
  }
}
