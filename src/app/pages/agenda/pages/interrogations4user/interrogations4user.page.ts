import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonBackButton, IonButtons, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonSelect, IonSelectOption, IonList, IonItem, IonLabel, IonBadge, IonIcon, IonText, IonItemSliding, IonItemOptions, IonItemOption, IonFab, IonFabButton, ModalController, AlertController } from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { UsersService } from 'src/app/shared/services/users.service';
import { SubjectService } from 'src/app/pages/subjects-list/services/subjects/subject.service';
import { AgendaService } from 'src/app/shared/services/agenda.service';
import { UserModel } from 'src/app/shared/models/userModel';
import { SubjectModel } from 'src/app/pages/subjects-list/models/subjectModel';
import { AgendaEvent } from 'src/app/pages/agenda/models/agendaEvent';
import { QueryCondition } from 'src/app/shared/models/queryCondition';
import { addIcons } from 'ionicons';
import { calendar, mic, documentText, book, people, chatbubbles, calendarOutline, trashOutline, createOutline, add, save } from 'ionicons/icons';
import { AgendaEventInputComponent } from 'src/app/shared/components/agenda-event-input/agenda-event-input.component';
import { ToasterService } from 'src/app/shared/services/toaster.service';

@Component({
  selector: 'app-interrogations4user',
  templateUrl: './interrogations4user.page.html',
  styleUrls: ['./interrogations4user.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonBackButton, IonButtons, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonSelect, IonSelectOption, IonList, IonItem, IonLabel, IonBadge, IonIcon, IonText, IonItemSliding, IonItemOptions, IonItemOption, IonFab, IonFabButton, CommonModule, FormsModule, DatePipe]
})
export class Interrogations4userPage implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private usersService = inject(UsersService);
  private subjectService = inject(SubjectService);
  private agendaService = inject(AgendaService);
  private modalCtrl = inject(ModalController);
  private alertCtrl = inject(AlertController);
  private toaster = inject(ToasterService);

  student = signal<UserModel | null>(null);
  allSubjects = signal<SubjectModel[]>([]);
  selectedSubjectKey = signal<string>('all');
  
  agendaEvents = signal<AgendaEvent[]>([]);
  
  private agendaSub?: () => void;
  private teachersSub?: () => void;

  filteredEvents = computed(() => {
    const events = this.agendaEvents();
    const subjectFilter = this.selectedSubjectKey();
    
    // Sort chronologically
    let filtered = events.sort((a, b) => new Date(a.dataInizio).getTime() - new Date(b.dataInizio).getTime());
    
    if (subjectFilter !== 'all') {
      filtered = filtered.filter(e => e.subjectKey === subjectFilter);
    }
    
    return filtered;
  });

  constructor() { 
    addIcons({ calendar, mic, documentText, book, people, chatbubbles, 'trash-outline': trashOutline, 'create-outline': createOutline, add, save, 'calendar-outline': calendarOutline });
  }

  ngOnInit() {
    const studentKey = this.route.snapshot.paramMap.get('studentKey');
    if (studentKey) {
      this.loadStudentAndData(studentKey);
    }
  }

  async loadStudentAndData(studentKey: string) {
    const user = await this.usersService.getUser(studentKey);
    if (user) {
      this.student.set(user);
      if (user.classKey) {
        this.loadSubjects(user.classKey);
        this.loadAgendaEvents(studentKey);
      }
    }
  }

  loadSubjects(classKey: string) {
    this.teachersSub = this.usersService.getUsersOnRealTime(
      (teachers) => {
        const allKeys = new Set<string>();
        teachers.forEach(t => {
          const ac = t.assignedClasses?.find(c => c.key === classKey);
          ac?.subjectsKey?.forEach(k => allKeys.add(k));
        });

        if (allKeys.size > 0) {
          this.subjectService.fetchSubjectsByKeys(Array.from(allKeys)).then(subs => {
            this.allSubjects.set(subs);
          });
        } else {
          this.allSubjects.set([]);
        }
      },
      [new QueryCondition('classes', 'array-contains', classKey)]
    );
  }

  loadAgendaEvents(studentKey: string) {
    if (this.agendaSub) {
      this.agendaSub();
    }
    
    // Fetch events where this student is targeted
    this.agendaSub = this.agendaService.getAgenda4targetedClassesOnrealtime((events) => {
      const interrogations = events.filter(e => e.type === 'interrogation');
      this.agendaEvents.set(interrogations);
    }, [new QueryCondition('targetStudents', 'array-contains', studentKey)]);
  }

  onSubjectChange(event: any) {
    this.selectedSubjectKey.set(event.detail.value);
  }

  async editEvent(event: AgendaEvent) {
    const modal = await this.modalCtrl.create({
      component: AgendaEventInputComponent,
      componentProps: {
        event: event,
        classKey: event.classKey,
        teacherKey: event.teacherKey
      }
    });

    await modal.present();
  }

  async deleteEvent(event: AgendaEvent) {
    const student = this.student();
    const dateStr = new Date(event.dataInizio).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const subjectName = this.getSubjectName(event.subjectKey);
    
    const alert = await this.alertCtrl.create({
      header: 'Conferma eliminazione',
      message: `Vuoi davvero eliminare l'interrogazione di ${subjectName} del ${dateStr} per lo studente ${student?.firstName} ${student?.lastName}?`,
      buttons: [
        {
          text: 'Annulla',
          role: 'cancel'
        },
        {
          text: 'Elimina',
          role: 'destructive',
          handler: async () => {
            if (event.key) {
              try {
                await this.agendaService.deleteEvent(event.key);
                this.toaster.showToast({ message: 'Interrogazione eliminata', duration: 2000, position: 'top' }, 'success');
              } catch (error) {
                console.error('Error deleting event:', error);
                this.toaster.showToast({ message: 'Errore durante l\'eliminazione', duration: 2000, position: 'top' }, 'danger');
              }
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async scheduleInterrogation() {
    const user = this.student();
    if (!user) return;

    const modal = await this.modalCtrl.create({
      component: AgendaEventInputComponent,
      componentProps: {
        defaultType: 'interrogation',
        classKey: user.classKey ? [user.classKey] : [],
        defaultTargetStudents: [user.key],
        defaultSubjectKey: this.selectedSubjectKey() !== 'all' ? this.selectedSubjectKey() : undefined,
        preloadedStudents: [user],
        preloadedSubjects: this.allSubjects()
      }
    });

    await modal.present();
  }

  ngOnDestroy() {
    if (this.agendaSub) this.agendaSub();
    if (this.teachersSub) this.teachersSub();
  }

  getSubjectName(subjectKey: string | undefined): string {
    if (!subjectKey) return 'Materia Sconosciuta';
    const subject = this.allSubjects().find(s => s.key === subjectKey);
    return subject ? subject.name : 'Materia Sconosciuta';
  }
}
