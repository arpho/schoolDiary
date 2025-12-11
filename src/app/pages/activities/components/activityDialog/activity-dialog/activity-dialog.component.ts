import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivityModel } from '../../../models/activityModel';
import { ClasseModel } from 'src/app/pages/classes/models/classModel';
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
  close
} from 'ionicons/icons';

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
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    // Ionic Components
    IonDatetime,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonContent,
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
    DatePipe
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ActivityDialogComponent implements OnInit {
  @Input() listaClassi: ClasseModel[] = [];
  @Input() selectedClass = '';
  @Input() activity: ActivityModel = new ActivityModel();
  
  activityForm!: FormGroup;
  isSubmitted = false;
  minDate = new Date().toISOString();
  isLoading = false;
  
  // Error message that updates in real-time
  errorMessage = '';
  
  // Current datetime being edited
  currentDatetimeField: 'date' | 'dueDate' | null = null;
  
  // Form controls for easier access
  get titleControl() { return this.activityForm.get('title'); }
  get descriptionControl() { return this.activityForm.get('description'); }
  get classKeyControl() { return this.activityForm.get('classKey'); }
  get subjectControl() { return this.activityForm.get('subject'); }
  get dateControl() { return this.activityForm.get('date'); }
  get dueDateControl() { return this.activityForm.get('dueDate'); }
  
  // Update error message based on form state
  private updateErrorMessage(): void {
    if (!this.isSubmitted) {
      this.errorMessage = '';
      return;
    }

    const errors: string[] = [];

    if (this.titleControl?.errors?.['required']) {
      errors.push('Il titolo è obbligatorio');
    } else if (this.titleControl?.errors?.['minlength']) {
      errors.push('Il titolo deve essere di almeno 3 caratteri');
    } else if (this.titleControl?.errors?.['maxlength']) {
      errors.push('Il titolo non può superare i 100 caratteri');
    }

    if (this.descriptionControl?.errors?.['required']) {
      errors.push('La descrizione è obbligatoria');
    } else if (this.descriptionControl?.errors?.['minlength']) {
      errors.push('La descrizione deve essere di almeno 10 caratteri');
    } else if (this.descriptionControl?.errors?.['maxlength']) {
      errors.push('La descrizione non può superare i 500 caratteri');
    }

    if (this.classKeyControl?.errors?.['required']) {
      errors.push('La classe è obbligatoria');
    }

    if (this.subjectControl?.errors?.['required']) {
      errors.push('La materia è obbligatoria');
    }

    if (this.dateControl?.errors?.['required']) {
      errors.push('La data è obbligatoria');
    } else if (this.dateControl?.errors?.['matDatepickerMin']) {
      errors.push('La data non può essere precedente a oggi');
    } else if (this.dateControl?.errors?.['matDatepickerMax']) {
      errors.push('La data non può essere successiva alla data di scadenza');
    }

    if (this.dueDateControl?.errors?.['matDatepickerMin']) {
      errors.push('La data di scadenza non può essere precedente alla data di inizio');
    }

    this.errorMessage = errors.length > 0 ? errors.join('. ') + '.' : '';
  }

  constructor(
    private fb: FormBuilder,
    private modalController: ModalController,
    private datePipe: DatePipe
  ) {
    addIcons({
      arrowBack,
      calendarOutline,
      timeOutline,
      schoolOutline,
      personOutline,
      create,
      warning,
      checkmarkCircleOutline,
      closeCircleOutline,
      close
    });
  }

  ngOnInit(): void {
    this.initializeForm();
    
    // Subscribe to form value changes to update error message
    this.activityForm.valueChanges.subscribe(() => {
      if (this.isSubmitted) {
        this.updateErrorMessage();
      }
    });
    
    // Subscribe to date changes to update min/max dates
    this.dateControl?.valueChanges.subscribe(() => {
      if (this.dateControl?.value && this.dueDateControl?.value && 
          new Date(this.dateControl.value) > new Date(this.dueDateControl.value)) {
        this.dueDateControl?.setValue(null);
      }
    });
  }

  private initializeForm(): void {
    this.activityForm = this.fb.group({
      title: [this.activity?.title || '', [
        Validators.required, 
        Validators.minLength(3),
        Validators.maxLength(100)
      ]],
      description: [this.activity?.description || '', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(500)
      ]],
      classKey: [this.activity?.classKey || this.selectedClass || '', [
        Validators.required
      ]],
      date: [this.activity?.date || this.minDate, [
        Validators.required
      ]],
      dueDate: [this.activity?.dueDate || null]
    });
  }

  async onSubmit(): Promise<void> {
    this.isSubmitted = true;
    this.updateErrorMessage();
    
    if (this.activityForm.invalid) {
      return;
    }
    
    this.isLoading = true;
    
    try {
      // Create activity object from form values
      const formValue = this.activityForm.value;
      const activity: ActivityModel = {
        ...this.activity, // Preserve existing properties if editing
        ...formValue
      };
      
      await this.modalController.dismiss(activity);
    } catch (error) {
      console.error('Error saving activity:', error);
      // In a real app, you might want to show an error toast/message
    } finally {
      this.isLoading = false;
    }
  }

  closeDialog(): void {
    this.modalController.dismiss();
  }

  // Open datetime picker
  async openDatetimePicker(field: 'date' | 'dueDate') {
    this.currentDatetimeField = field;
  }

  // Handle datetime change
  onDatetimeChange(event: Event, field: 'date' | 'dueDate') {
    const customEvent = event as IonDatetimeCustomEvent<DatetimeChangeEventDetail>;
    const value = customEvent.detail.value;
    if (value) {
      this.activityForm.get(field)?.setValue(value);
      this.activityForm.get(field)?.markAsTouched();
    }
    this.currentDatetimeField = null;
  }

  // Format date for display
  formatDate(dateString: string): string {
    if (!dateString) return 'Seleziona data';
    return this.datePipe.transform(dateString, 'dd/MM/yyyy') || 'Seleziona data';
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  onCancel(): void {
    this.modalController.dismiss(null, 'cancel');
  }



}
