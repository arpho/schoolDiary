import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
// Icons will be used directly in the template with their string names

@Component({
  selector: 'app-activity-detail',
  templateUrl: './activity-detail.component.html',
  styleUrls: ['./activity-detail.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    DatePipe,
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
  ]
})
export class ActivityDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private activitiesService = inject(ActivitiesService);
  private classiService = inject(ClassiService);
  private usersService = inject(UsersService);
  
  activity: ActivityModel | null | undefined = null;
  classe = signal<ClasseModel | null>(null);
  teacher = signal<UserModel | null>(null);
  isLoading = true;
  error: string | null = null;

  constructor() {
    // No need to register icons as we'll use them directly in the template
  }

  async ngOnInit() {
    const activityKey = this.route.snapshot.paramMap.get('activityKey');
    
    if (!activityKey) {
      this.error = 'Nessuna attività specificata';
      this.isLoading = false;
      return;
    }
    
    try {
      this.activity = await this.activitiesService.getActivity(activityKey);
      if (!this.activity) {
        this.error = 'Attività non trovata';
        this.isLoading = false;
        return;
      }

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
  
  goBack() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  editActivity() {
    if (this.activity?.key) {
      this.router.navigate(['/activity-dialog', this.activity.key]);
    }
  }
}
