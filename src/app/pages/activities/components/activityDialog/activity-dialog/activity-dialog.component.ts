import { Component, Input, OnInit, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { form, schema, FormField, FormRoot, required, minLength, maxLength } from '@angular/forms/signals';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivityModel } from '../../../models/activityModel';
import { ClasseModel } from 'src/app/pages/classes/models/classModel';
import { SubjectModel } from 'src/app/pages/subjects-list/models/subjectModel';
import { ModalController } from '@ionic/angular/standalone';
import { IonDatetimeCustomEvent, DatetimeChangeEventDetail } from '@ionic/core';

// Ionic Components
import {
  IonDatetime,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonContent,
  IonFooter,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
  IonTextarea,
  IonButtons,
  IonNote,
  IonRow,
  IonCol,
  IonGrid,
  IonSpinner
} from '@ionic/angular/standalone';

// Icons
import { addIcons } from 'ionicons';
import {
  arrowBack,
  calendarOutline,
  timeOutline,
  schoolOutline,
  personOutline,
  create,
  warning,
  checkmarkCircleOutline,
  closeCircleOutline,
  close,
  calendar,
  checkmark
} from 'ionicons/icons';
import { UsersService } from 'src/app/shared/services/users.service';

/**
 * Dialog modale per la creazione o modifica di un'attività.
 * Contiene il form per inserire i dettagli dell'attività.
 */
@Component({
  selector: 'app-activity-dialog',
  templateUrl: './activity-dialog.component.html',
  styleUrls: ['./activity-dialog.component.scss'],
  providers: [DatePipe],
  host: {
    'style': '--height: 90%; --border-radius: 16px; --box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);'
  },
  standalone: true,
  imports: [
    FormsModule,
    IonDatetime,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonContent,
    IonFooter,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonIcon,
    IonTextarea,
    IonButtons,
    IonNote,
    IonRow,
    IonCol,
    IonGrid,
    IonSpinner,
    DatePipe,
    FormField,
    FormRoot
],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ActivityDialogComponent implements OnInit {
  $users = inject(UsersService);
  @Input() listaClassi: ClasseModel[] = [];
  @Input() listaMaterie: SubjectModel[] = [];
  @Input() selectedClass = '';
  @Input() activity: ActivityModel = new ActivityModel();

  isSubmitted = signal(false);
  minDate = new Date().toISOString();
  isLoading = signal(false);

  // Error message that updates in real-time
  errorMessage = signal('');

  // Current datetime being edited
  currentDatetimeField = signal<'date' | 'dueDate' | null>(null);
  hasSubjects = signal(false);

  get resolvedActivity(): ActivityModel | undefined {
    const raw = this.activity as unknown;
    if (typeof raw === 'function') {
      return (raw as () => ActivityModel)();
    }
    return this.activity;
  }

  get isEdit(): boolean {
    return !!this.resolvedActivity?.key;
  }

  activityModel = signal({
    title: '',
    description: '',
    classKey: '',
    subjectsKey: '',
    date: '',
    dueDate: null as string | null
  });

  activityForm = form(this.activityModel, schema((s) => {
    required(s.title);
    minLength(s.title, 3);
    maxLength(s.title, 100);
    required(s.description);
    minLength(s.description, 10);
    maxLength(s.description, 500);
    required(s.classKey);
    required(s.subjectsKey, {
      when: () => this.hasSubjects()
    });
    required(s.date);
  }));

  // Helper properties to access form control properties for template
  get titleControl() { return this.activityForm.title; }
  get descriptionControl() { return this.activityForm.description; }
  get classKeyControl() { return this.activityForm.classKey; }
  get subjectControl() { return this.activityForm.subjectsKey; }
  get dateControl() { return this.activityForm.date; }
  get dueDateControl() { return this.activityForm.dueDate; }

  // Update error message based on form state
  protected updateErrorMessage(): void {
    const errors: string[] = [];

    if (this.titleControl().invalid()) {
      if (this.titleControl().getError('required')) errors.push('Il titolo è obbligatorio');
      else if (this.titleControl().getError('minLength')) errors.push('Il titolo deve essere di almeno 3 caratteri');
      else if (this.titleControl().getError('maxLength')) errors.push('Il titolo non può superare i 100 caratteri');
    }

    if (this.descriptionControl().invalid()) {
      if (this.descriptionControl().getError('required')) errors.push('La descrizione è obbligatoria');
      else if (this.descriptionControl().getError('minLength')) errors.push('La descrizione deve essere di almeno 10 caratteri');
      else if (this.descriptionControl().getError('maxLength')) errors.push('La descrizione non può superare i 500 caratteri');
    }

    if (this.classKeyControl().invalid()) {
      errors.push('La classe è obbligatoria');
    }

    if (this.hasSubjects() && this.subjectControl().invalid()) {
      errors.push('La materia è obbligatoria');
    }

    if (this.dateControl().invalid()) {
      if (this.dateControl().getError('required')) errors.push('La data è obbligatoria');
    }

    // Custom date validations (normalized to calendar day to avoid time-of-day false positives)
    const dateVal = this.dateControl().value();
    const dueDateVal = this.dueDateControl().value();

    if (dateVal) {
      const startDay = new Date(dateVal);
      startDay.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (!this.isEdit && startDay < today) {
        errors.push('La data non può essere precedente a oggi');
      }

      if (dueDateVal) {
        const dueDay = new Date(dueDateVal);
        dueDay.setHours(0, 0, 0, 0);
        if (startDay > dueDay) {
          errors.push('La data di scadenza non può essere precedente alla data di inizio');
        }
      }
    }

    this.errorMessage.set(errors.length > 0 ? errors.join('. ') + '.' : '');
  }

  constructor(
    private modalController: ModalController,
    private datePipe: DatePipe
  ) {
    addIcons({ close, warning, create, calendar, checkmarkCircleOutline, checkmark, arrowBack, calendarOutline, timeOutline, schoolOutline, personOutline, closeCircleOutline });
  }

  ngOnInit(): void {
    this.hasSubjects.set((this.listaMaterie?.length ?? 0) > 0);
    this.initializeForm();
  }

  private initializeForm(): void {
    const act = this.resolvedActivity;
    this.activityForm().value.update(v => ({...v, ...({
      title: act?.title || '',
      description: act?.description || '',
      classKey: act?.classKey || this.selectedClass || '',
      subjectsKey: act?.subjectsKey || '',
      date: act?.date || this.minDate,
      dueDate: act?.dueDate || null
    })}));
  }

  /**
   * Gestisce il submit del form e chiude il modale con i dati aggiornati.
   */
  async onSubmit(): Promise<void> {
    this.isSubmitted.set(true);
    this.updateErrorMessage();

    if (this.activityForm().invalid() || this.errorMessage() !== '') {
      return;
    }

    this.isLoading.set(true);

    try {
      // Create activity object from form values
      const formValue = this.activityForm().value();
      const teacher = await this.$users.getLoggedUser();
      const baseActivity = this.resolvedActivity;
      const activity = new ActivityModel({
        ...baseActivity,
        ...formValue,
        dueDate: formValue.dueDate || '',
        teacherKey: baseActivity?.teacherKey || (teacher ? teacher.key : '')
      });
      if (baseActivity?.key) {
        activity.setKey(baseActivity.key);
      }

      await this.modalController.dismiss(activity);
    } catch (error) {
      console.error('Error saving activity:', error);
      this.errorMessage.set('Si è verificato un errore durante il salvataggio.');
    } finally {
      this.isLoading.set(false);
    }
  }

  closeDialog(): void {
    this.modalController.dismiss();
  }

  // Open datetime picker
  async openDatetimePicker(field: 'date' | 'dueDate') {
    this.currentDatetimeField.set(field);
  }

  // Handle datetime change
  onDatetimeChange(event: Event, field: 'date' | 'dueDate') {
    const customEvent = event as IonDatetimeCustomEvent<DatetimeChangeEventDetail>;
    const value = customEvent.detail.value;
    if (value) {
      this.activityForm().value.update(v => ({...v, ...({ [field]: value as string })}));
      // update min/max dynamically
      if (field === 'date' && this.dueDateControl().value()) {
        const startDay = new Date(value as string);
        startDay.setHours(0, 0, 0, 0);
        const dueDay = new Date(this.dueDateControl().value()!);
        dueDay.setHours(0, 0, 0, 0);
        if (startDay > dueDay) {
          this.activityForm().value.update(v => ({...v, ...({ dueDate: null })}));
        }
      }
    }
    this.currentDatetimeField.set(null);
    this.updateErrorMessage();
  }

  // Format date for display
  formatDate(dateString: string | null | undefined): string {
    if (!dateString) return 'Seleziona data';
    return this.datePipe.transform(dateString, 'dd/MM/yyyy') || 'Seleziona data';
  }

  onCancel(): void {
    this.modalController.dismiss(null, 'cancel');
  }

}
