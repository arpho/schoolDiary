import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivityModel } from '../../../models/activityModel';
import { ClasseModel } from 'src/app/pages/classes/models/classModel';
import { ModalController } from '@ionic/angular/standalone';

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
    IonSpinner
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
  
  // Form controls for easier access
  get titleControl() { return this.activityForm.get('title'); }
  get descriptionControl() { return this.activityForm.get('description'); }
  get classKeyControl() { return this.activityForm.get('classKey'); }
  get dateControl() { return this.activityForm.get('date'); }
  get dueDateControl() { return this.activityForm.get('dueDate'); }

  constructor(
    private fb: FormBuilder,
    private modalController: ModalController
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
    
    // Mark all fields as touched to trigger validation messages
    this.markFormGroupTouched(this.activityForm);
    
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
