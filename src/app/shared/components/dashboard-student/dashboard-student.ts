import { Component, OnInit, inject, signal, effect, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonSegment, IonSegmentButton, IonLabel, IonContent, IonSelect, IonSelectOption, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonItem, IonList, IonBadge, IonIcon, IonText } from '@ionic/angular/standalone';
import { UsersService } from 'src/app/shared/services/users.service';
import { ActivitiesService } from 'src/app/pages/activities/services/activities.service';
import { EvaluationService } from 'src/app/pages/evaluations/services/evaluation/evaluation.service';
import { AgendaService } from 'src/app/shared/services/agenda.service';
import { SubjectService } from 'src/app/pages/subjects-list/services/subjects/subject.service';
import { UserModel } from 'src/app/shared/models/userModel';
import { ActivityModel } from 'src/app/pages/activities/models/activityModel';
import { Evaluation } from 'src/app/pages/evaluations/models/evaluation';
import { AgendaEvent } from 'src/app/pages/agenda/models/agendaEvent';
import { QueryCondition } from 'src/app/shared/models/queryCondition';
import { SubjectModel } from 'src/app/pages/subjects-list/models/subjectModel';
import { UsersRole } from 'src/app/shared/models/usersRole';

@Component({
  standalone: true,
  templateUrl: './dashboard-student.html',
  styleUrls: ['./dashboard-student.scss'],
  imports: [
    CommonModule, 
    FormsModule, 
    IonSegment, 
    IonSegmentButton, 
    IonLabel, 
    IonContent, 
    IonSelect, 
    IonSelectOption, 
    IonCard, 
    IonCardHeader, 
    IonCardTitle, 
    IonCardSubtitle, 
    IonCardContent, 
    IonItem, 
    IonList,
    IonBadge,
    IonIcon,
    IonText,
    DatePipe
  ]
})
export class DashboardStudentComponent implements OnInit, OnDestroy {
  private usersService = inject(UsersService);
  private activitiesService = inject(ActivitiesService);
  private evaluationService = inject(EvaluationService);
  private agendaService = inject(AgendaService);
  private subjectService = inject(SubjectService);

  activeTab = signal<string>('attivita');
  
  loggedUser = signal<UserModel | null>(null);
  
  // Teachers and Subjects for filters
  teachersList = signal<UserModel[]>([]);
  subjectsList = signal<SubjectModel[]>([]);
  
  selectedTeacherKey = signal<string>('all');
  selectedSubjectKey = signal<string>('all');
  
  // Data
  activities = signal<ActivityModel[]>([]);
  evaluations = signal<Evaluation[]>([]);
  agendaEvents = signal<AgendaEvent[]>([]);

  // Unsubscribe functions
  private activitiesSub?: () => void;
  private evaluationsSub?: () => void;
  private agendaSub?: () => void;
  private teachersSub?: () => void;

  constructor() {}

  async ngOnInit() {
    const user = await this.usersService.getLoggedUser();
    if (user && user.classKey) {
      this.loggedUser.set(user);
      this.loadTeachers(user.classKey);
      this.loadEvaluations(user.key);
      this.loadAgenda(user.classKey);
      // Wait for subjects to load based on the first load of activities (after user is set)
      this.loadActivities();
    }
  }

  loadTeachers(classKey: string) {
    // Teachers are users with role TEACHER and classes containing student's classKey
    this.teachersSub = this.usersService.getUsersOnRealTime(
      (users) => {
        this.teachersList.set(users);
      },
      [new QueryCondition('role', '==', UsersRole.TEACHER), new QueryCondition('classes', 'array-contains', classKey)]
    );
  }

  loadActivities() {
    const user = this.loggedUser();
    if (!user || !user.classKey) return;

    if (this.activitiesSub) {
      this.activitiesSub();
    }

    const tKey = this.selectedTeacherKey();
    const sKey = this.selectedSubjectKey();

    let conditions: QueryCondition[] = [];
    conditions.push(new QueryCondition('classKey', '==', user.classKey));
    
    if (tKey !== 'all') {
      conditions.push(new QueryCondition('teacherKey', '==', tKey));
    }
    
    if (sKey !== 'all') {
      conditions.push(new QueryCondition('subjectsKey', '==', sKey));
    }

    this.activitiesSub = this.activitiesService.fetchActivitiesOnRealTime((acts) => {
       // Also populate subjects based on activities if subject filter is 'all'
       if (sKey === 'all' && tKey === 'all') {
         const uniqueSubjectKeys = [...new Set(acts.map(a => a.subjectsKey).filter(k => k))];
         if (uniqueSubjectKeys.length > 0) {
            this.subjectService.fetchSubjectsByKeys(uniqueSubjectKeys).then(subs => {
               this.subjectsList.set(subs);
            });
         }
       }
       this.activities.set(acts);
    }, conditions);
  }
  
  onTeacherChange(event: any) {
    this.selectedTeacherKey.set(event.detail.value);
    
    // Update subjects available based on selected teacher if needed, 
    // or we can just fetch all subjects for that teacher and class
    const tKey = this.selectedTeacherKey();
    const user = this.loggedUser();
    if (tKey !== 'all' && user && user.classKey) {
       this.usersService.getSubjectsByTeacherAndClass(tKey, user.classKey).then(subs => {
          this.subjectsList.set(subs);
       });
       // If selected subject is not in the new list, reset it
       this.selectedSubjectKey.set('all');
    } else {
       // Reset subjects logic will run inside loadActivities when both are 'all'
       this.selectedSubjectKey.set('all');
    }
    
    this.loadActivities();
  }

  onSubjectChange(event: any) {
    this.selectedSubjectKey.set(event.detail.value);
    this.loadActivities();
  }

  loadEvaluations(studentKey: string) {
    if (this.evaluationsSub) {
       this.evaluationsSub();
    }
    this.evaluationsSub = this.evaluationService.getEvaluationsOnRealtime((evals) => {
        this.evaluations.set(evals);
    }, [new QueryCondition('studentKey', '==', studentKey)]);
  }

  loadAgenda(classKey: string) {
     if (this.agendaSub) {
        this.agendaSub();
     }
     this.agendaSub = this.agendaService.getAgenda4targetedClassesOnrealtime((events) => {
        // Filter out 'note' events since they are considered reserved or not for students
        // E non carichiamo i servizi reservedNotes4class e reservednotes4student.
        const filteredEvents = events.filter(e => e.type !== 'note');
        // Sort chronologically
        filteredEvents.sort((a, b) => new Date(a.dataInizio).getTime() - new Date(b.dataInizio).getTime());
        this.agendaEvents.set(filteredEvents);
     }, [new QueryCondition('classKey', 'array-contains-any', [classKey])]);
  }

  segmentChanged(event: any) {
    this.activeTab.set(event.detail.value);
  }

  ngOnDestroy() {
    if (this.activitiesSub) this.activitiesSub();
    if (this.evaluationsSub) this.evaluationsSub();
    if (this.agendaSub) this.agendaSub();
    if (this.teachersSub) this.teachersSub();
  }
  
  getTeacherName(teacherKey: string): string {
    const teacher = this.teachersList().find(t => t.key === teacherKey);
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Sconosciuto';
  }
  
  getSubjectName(subjectKey: string): string {
    const subject = this.subjectsList().find(s => s.key === subjectKey);
    return subject ? subject.name : 'Materia Sconosciuta';
  }
  
  getAgendaIcon(type: string): string {
    switch (type) {
       case 'homework': return 'book';
       case 'test': return 'document-text';
       case 'interrogation': return 'mic';
       case 'meeting': return 'people';
       case 'colloquio': return 'chatbubbles';
       default: return 'calendar';
    }
  }
  
  getAgendaColor(type: string): string {
    switch (type) {
       case 'homework': return 'primary';
       case 'test': return 'danger';
       case 'interrogation': return 'warning';
       case 'meeting': return 'tertiary';
       case 'colloquio': return 'secondary';
       default: return 'medium';
    }
  }
}
