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
import { GroupsService } from 'src/app/pages/classes/services/groups/groups.service';
import { GroupModel } from 'src/app/pages/classes/models/groupModel';

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
  private groupsService = inject(GroupsService);

  activeTab = signal<string>('attivita');
  
  loggedUser = signal<UserModel | null>(null);
  
  // Teachers and Subjects for filters
  teachersList = signal<UserModel[]>([]);
  subjectsList = signal<SubjectModel[]>([]);
  
  selectedTeacherKey = signal<string>('all');
  selectedSubjectKey = signal<string>('all');
  
  // Group Tab
  allClassSubjects = signal<SubjectModel[]>([]);
  selectedGroupSubjectKey = signal<string>('');
  studentGroup = signal<GroupModel | null>(null);
  
  // Data
  activities = signal<ActivityModel[]>([]);
  evaluations = signal<Evaluation[]>([]);
  agendaEvents = signal<AgendaEvent[]>([]);

  // Unsubscribe functions
  private activitiesSub?: () => void;
  private evaluationsSub?: () => void;
  private agendaSub?: () => void;
  private teachersSub?: () => void;

  constructor() {
    effect(() => {
      const teachers = this.teachersList();
      const user = this.loggedUser();
      const tKey = this.selectedTeacherKey();
      
      if (user && user.classKey) {
        // Collect all unique subject keys taught in this class
        const allKeys = new Set<string>();
        teachers.forEach(t => {
          const ac = t.assignedClasses?.find(c => c.key === user.classKey);
          ac?.subjectsKey?.forEach(k => allKeys.add(k));
        });

        if (allKeys.size > 0) {
          this.subjectService.fetchSubjectsByKeys(Array.from(allKeys)).then(subs => {
            this.allClassSubjects.set(subs);
            // If no teacher is selected, show all subjects in the activities filter
            if (tKey === 'all') {
              this.subjectsList.set(subs);
            }
          });
        } else {
          this.allClassSubjects.set([]);
          if (tKey === 'all') {
            this.subjectsList.set([]);
          }
        }
      }
    }, { allowSignalWrites: true });
  }

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
      [new QueryCondition('classes', 'array-contains', classKey)]
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
       this.selectedSubjectKey.set('all');
    } else {
       this.subjectsList.set(this.allClassSubjects());
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

  async onGroupSubjectChange(event: any) {
    const sKey = event.detail.value;
    this.selectedGroupSubjectKey.set(sKey);
    const user = this.loggedUser();
    if (user && user.classKey && sKey) {
      try {
        const group = await this.groupsService.fetchStudentGroup(user.key, user.classKey, sKey);
        this.studentGroup.set(group);
      } catch (error) {
        console.error("Errore caricamento gruppo:", error);
      }
    } else {
      this.studentGroup.set(null);
    }
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
    const subject = this.allClassSubjects().find(s => s.key === subjectKey);
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
