import { Component, input, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon, IonBadge, AlertController, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline } from 'ionicons/icons';
import { UserModel } from 'src/app/shared/models/userModel';
import { AgendaEvent } from 'src/app/pages/agenda/models/agendaEvent';
import { EventDialogComponent } from 'src/app/pages/agenda/components/event-dialog/event-dialog.component';
import { SubjectModel } from 'src/app/pages/subjects-list/models/subjectModel';

@Component({
  selector: 'app-student-scheduled-interrogation',
  template: `
    @if (nextInterrogation()) {
      <ion-badge color="warning" class="interrogation-badge" title="Interrogazioni programmate" (click)="showInterrogations($event)">
        <ion-icon name="calendar-outline"></ion-icon>
        @if (nextSubjectName()) { <span class="subject-name">{{ nextSubjectName() }} -</span> }
        {{ nextInterrogation()?.dataInizio | date:'dd MMM' }}
        @if (allInterrogations().length > 1) {
          <span>(+{{ allInterrogations().length - 1 }})</span>
        }
      </ion-badge>
    }
  `,
  styles: [`
    .interrogation-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.8em;
      padding: 4px 8px;
      font-weight: normal;
      cursor: pointer;
    }
    .subject-name {
      font-weight: bold;
      margin-right: 2px;
    }
    ion-icon {
      font-size: 1.1em;
    }
  `],
  standalone: true,
  imports: [CommonModule, IonIcon, IonBadge]
})
export class StudentScheduledInterrogationComponent {
  student = input.required<UserModel>();
  events = input<AgendaEvent[]>([]);
  subjectKey = input<string>('all');
  subjects = input<SubjectModel[]>([]);
  private modalCtrl = inject(ModalController);

  constructor() {
    addIcons({ calendarOutline });
  }

  allInterrogations = computed(() => {
    const student = this.student();
    const events = this.events();
    
    if (!student || !events || events.length === 0) return [];

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const interrogations = events.filter(event => {
      if (event.type !== 'interrogation') return false;
      
      const eventDate = new Date(event.dataInizio);
      if (eventDate < now) return false; // Solo eventi futuri o di oggi

      if (this.subjectKey() !== 'all' && event.subjectKey !== this.subjectKey()) return false; // Filtra per materia

      // 1. Controllo strutturato per targetStudents (Opzione 2)
      if (event.targetStudents && event.targetStudents.includes(student.key)) {
        return true;
      }

      // 2. Controllo retrocompatibile: ricerca del cognome nel titolo (Opzione 1)
      if (student.lastName && event.title) {
        const titleLower = event.title.toLowerCase();
        const lastNameLower = student.lastName.toLowerCase();
        if (titleLower.includes(lastNameLower)) {
          return true;
        }
      }

      return false;
    });

    // Ordina per data più vicina
    return interrogations.sort((a, b) => new Date(a.dataInizio).getTime() - new Date(b.dataInizio).getTime());
  });

  nextInterrogation = computed(() => {
    const list = this.allInterrogations();
    return list.length > 0 ? list[0] : null;
  });

  nextSubjectName = computed(() => {
    const nextInt = this.nextInterrogation();
    if (!nextInt || !nextInt.subjectKey) return '';
    const subject = this.subjects().find(s => s.key === nextInt.subjectKey);
    return subject ? subject.name : '';
  });

  async showInterrogations(event: Event) {
    event.stopPropagation(); // Previene l'apertura dell'action sheet dello studente
    
    const nextInt = this.nextInterrogation();
    if (!nextInt) return;

    const modal = await this.modalCtrl.create({
      component: EventDialogComponent,
      componentProps: {
        event: nextInt,
        // Passa la prima classe se presente, in modo che il dialog abbia un contesto
        classId: nextInt.classKey && nextInt.classKey.length > 0 ? nextInt.classKey[0] : '',
        teacherKey: nextInt.teacherKey
      },
      breakpoints: [0, 0.8, 1],
      initialBreakpoint: 0.8,
      handle: true,
      handleBehavior: 'cycle'
    });

    await modal.present();
  }
}
