import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { 
  IonInput, 
  IonTextarea, 
  IonDatetime, 
  IonSelect, 
  IonSelectOption 
} from '@ionic/angular/standalone';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonButton, 
  IonIcon, 
  IonItem, 
  IonLabel, 
  IonButtons,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonNote,
  IonSpinner,
  IonFab,
  IonFabButton
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivitiesService } from '../services/activities.service';
import { ActivityModel } from '../models/activityModel';
import { ClassiService } from '../../classes/services/classi.service';
import { UsersService } from '../../../shared/services/users.service';
import { ClasseModel } from '../../classes/models/classModel';
import { UserModel } from '../../../shared/models/userModel';
import { 
  personOutline, 
  warning, 
  create, 
  arrowBack, 
  calendarOutline, 
  timeOutline, 
  schoolOutline, 
  checkmarkCircleOutline, 
  closeCircleOutline 
} from 'ionicons/icons';
import { addIcons } from 'ionicons';
// Icons will be used directly in the template with their string names

@Component({
  selector: 'app-activity-detail',
  templateUrl: './activity-detail.component.html',
  styleUrls: ['./activity-detail.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    ReactiveFormsModule,
    DatePipe,
    // Ionic Components
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonButton, 
    IonIcon, 
    IonItem, 
    IonLabel, 
    IonButtons,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonNote,
    IonSpinner,
    IonFab,
    IonFabButton,
    // Form components
    IonInput,
    IonTextarea,
    IonDatetime,
    IonSelect,
    IonSelectOption
  ]
})
export class ActivityDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private activitiesService = inject(ActivitiesService);
  private classiService = inject(ClassiService);
  private usersService = inject(UsersService);
  private fb = inject(FormBuilder);
  
  activityForm!: FormGroup;
  
  activity: ActivityModel | null = null;
  classe = signal<ClasseModel | null>(null);
  teacher = signal<UserModel | null>(null);
  isLoading = true;
  error: string | null = null;
  isEditMode = false;
  minDate = new Date().toISOString();
  isSubmitted = false;

  constructor() {
    addIcons({
      'arrow-back': arrowBack,
      'calendar-outline': calendarOutline,
      'time-outline': timeOutline,
      'school-outline': schoolOutline,
      'person-outline': personOutline,
      'create': create,
      'warning': warning,
      'checkmark-circle-outline': checkmarkCircleOutline,
      'close-circle-outline': closeCircleOutline
    });
  }

  async ngOnInit() {
    const activityKey = this.route.snapshot.paramMap.get('activityKey');
    
    if (!activityKey) {
      this.error = 'Nessuna attività specificata';
      this.isLoading = false;
      return;
    }
    
    try {
      const activity = await this.activitiesService.getActivity(activityKey);
      if(activity){
        this.activity = activity
      }
      if (!activity) {
        this.error = 'Attività non trovata';
        this.isLoading = false;
        return;
      }

      // Initialize form with activity data
      this.initializeForm();
      
      // Load class and teacher details in parallel
      await Promise.all([
        this.loadClassDetails(),
        this.loadTeacherDetails()
      ]);
      
    } catch (err) {
      console.error('Errore nel caricamento dei dettagli:', err);
      this.error = 'Si è verificato un errore nel caricamento dei dettagli';
    } finally {
      this.isLoading = false;
    }
  }

  private async loadClassDetails() {
    if (!this.activity?.classKey) return;
    
    try {
      const classe = await this.classiService.fetchClasse(this.activity.classKey);
      if (classe) {
        this.classe.set(classe);
      }
    } catch (error) {
      console.error('Errore nel caricamento della classe:', error);
    }
  }

  private async loadTeacherDetails() {
    if (!this.activity?.teacherKey) return;
    
    try {
      const teacher = await this.usersService.fetchUser(this.activity.teacherKey);
      if (teacher) {
        this.teacher.set(teacher);
      }
    } catch (error) {
      console.error('Errore nel caricamento del docente:', error);
    }
  }
  
  // Form controls for easier access
  get titleControl() { return this.activityForm.get('title'); }
  get descriptionControl() { return this.activityForm.get('description'); }
  get classKeyControl() { return this.activityForm.get('classKey'); }
  get dateControl() { return this.activityForm.get('date'); }
  get dueDateControl() { return this.activityForm.get('dueDate'); }

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
      classKey: [this.activity?.classKey || '', [
        Validators.required
      ]],
      date: [this.activity?.date || this.minDate, [
        Validators.required
      ]],
      dueDate: [this.activity?.dueDate || null]
    });

    // Disable class selection if not in edit mode
    if (!this.isEditMode) {
      this.classKeyControl?.disable();
    }
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    
    if (this.isEditMode) {
      this.classKeyControl?.enable();
    } else {
      this.classKeyControl?.disable();
      // Reset form to original values
      this.initializeForm();
    }
  }

  async onSubmit(): Promise<void> {
    this.isSubmitted = true;
    
    if (this.activityForm.invalid) {
      return;
    }
    
    if (!this.activity?.key) {
      this.error = 'Impossibile salvare: ID attività mancante';
      return;
    }
    
    this.isLoading = true;
    
    try {
      const formValue = this.activityForm.value;
      const updatedActivity: ActivityModel = {
        ...this.activity,
        ...formValue,
        key: this.activity.key, // Ensure we keep the original key
        // Ensure dates are in the correct format
        date: formValue.date,
        dueDate: formValue.dueDate || null
      };
      
      await this.activitiesService.updateActivity(updatedActivity.key, updatedActivity);
      this.activity = updatedActivity;
      this.isEditMode = false;
      
      // Show success message or navigate
      // You might want to add a toast notification here
      
    } catch (error) {
      console.error('Errore durante il salvataggio:', error);
      this.error = 'Si è verificato un errore durante il salvataggio';
    } finally {
      this.isLoading = false;
    }
  }

  onCancelEdit(): void {
    this.isEditMode = false;
    this.initializeForm();
  }

  goBack() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  // Keep the editActivity method if you still need it for navigation
  editActivity() {
    if (this.activity?.key) {
      this.router.navigate(['/activity-dialog', this.activity.key]);
    }
  }
}
