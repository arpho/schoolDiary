import { Component, Input, OnInit, inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonButton, 
  IonButtons, 
  IonIcon, 
  IonItem, 
  IonLabel, 
  IonInput, 
  IonTextarea, 
  IonDatetime, 
  IonDatetimeButton, 
  IonModal,
  IonText,
  ModalController,
  ToastController
} from '@ionic/angular/standalone';
import { ActivityModel } from '../../models/activityModel';
import { ActivitiesService } from '../../services/activities.service';
// Import delle icone gestite a livello globale
import { close, save } from 'ionicons/icons';
import { UsersService } from 'src/app/shared/services/users.service';

@Component({
  selector: 'app-activity-dialog',
  templateUrl: './activity-dialog.component.html',
  styleUrls: ['./activity-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonButtons,
    IonIcon,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonDatetime,
    IonDatetimeButton,
    IonModal,
    IonText
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ActivityDialogComponent implements OnInit {
  private modalCtrl = inject(ModalController);
  private activitiesService = inject(ActivitiesService);
  private toastCtrl = inject(ToastController);

  activityForm: FormGroup;
  activityKey?: string;
  classKey?: string;
  teacherKey?: string;
  minDate = new Date().toISOString();
  maxDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString();
 $users=inject(UsersService)
  constructor(private formBuilder: FormBuilder) {
    // Inizializzazione del form
    this.activityForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', Validators.maxLength(500)],
      date: [new Date().toISOString(), Validators.required],
      dueDate: [null]
    });
  }

  ngOnInit() {
    if (this.activityKey) {
      this.loadActivity();
    }
  }

  private async loadActivity() {
    try {
      const activity = await this.activitiesService.getActivity(this.activityKey!);
      if (activity) {
        this.activityForm.patchValue({
          title: activity.title,
          description: activity.description,
          date: activity.date,
          dueDate: activity.dueDate || null
        });
      }
    } catch (error) {
      console.error('Error loading activity:', error);
      this.showToast('Errore nel caricamento dell\'attività', 'danger');
    }
  }

  async save() {
    if (this.activityForm.invalid) {
      this.showToast('Compila tutti i campi obbligatori', 'warning');
      return;
    }

    const formValue = this.activityForm.value;
    const teacher = await this.$users.getLoggedUser()
    
    // Crea un'istanza di ActivityModel con i valori del form
    const activity = new ActivityModel({
      title: formValue.title,
      description: formValue.description,
      date: formValue.date,
      teacherKey: teacher? teacher.key : '',
      dueDate: formValue.dueDate || null,
      classKey: this.classKey || '',
    });

    try {
      if (this.activityKey) {
        // Aggiorna l'attività esistente
        await this.activitiesService.updateActivity(this.activityKey, activity);
        this.showToast('Attività aggiornata con successo');
      } else {
        // Crea una nuova attività
        await this.activitiesService.addActivity(activity);
        this.showToast('Attività creata con successo');
      }
      this.dismiss(true);
    } catch (error) {
      console.error('Error saving activity:', error);
      this.showToast('Errore nel salvataggio dell\'attività', 'danger');
    }
  }

  async dismiss(saved = false) {
    await this.modalCtrl.dismiss({
      saved: saved
    });
  }

  private async showToast(message: string, color: string = 'success') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}
