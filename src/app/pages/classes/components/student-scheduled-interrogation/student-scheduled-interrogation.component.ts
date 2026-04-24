import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon, IonBadge } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline } from 'ionicons/icons';
import { UserModel } from 'src/app/shared/models/userModel';
import { AgendaEvent } from 'src/app/pages/agenda/models/agendaEvent';

@Component({
  selector: 'app-student-scheduled-interrogation',
  template: `
    @if (nextInterrogation()) {
      <ion-badge color="warning" class="interrogation-badge" title="Interrogazione programmata">
        <ion-icon name="calendar-outline"></ion-icon>
        {{ nextInterrogation()?.dataInizio | date:'dd MMM' }}
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

  constructor() {
    addIcons({ calendarOutline });
  }

  nextInterrogation = computed(() => {
    const student = this.student();
    const events = this.events();
    
    if (!student || !events || events.length === 0) return null;

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const interrogations = events.filter(event => {
      if (event.type !== 'interrogation') return false;
      
      const eventDate = new Date(event.dataInizio);
      if (eventDate < now) return false; // Solo eventi futuri o di oggi

      // 1. Controllo strutturato per targetStudents (Opzione 2)
      if (event.targetStudents && event.targetStudents.includes(student.key)) {
        return true;
      }

      // 2. Controllo retrocompatibile: ricerca del cognome nel titolo (Opzione 1)
      if (student.lastName && event.title) {
        const titleLower = event.title.toLowerCase();
        const lastNameLower = student.lastName.toLowerCase();
        // Aggiungiamo boundries per evitare falsi positivi (es. "Rossini" quando cerchiamo "Rossi")
        // ma per semplicità la tua proposta era includes
        if (titleLower.includes(lastNameLower)) {
          return true;
        }
      }

      return false;
    });

    if (interrogations.length === 0) return null;

    // Ordina per data più vicina
    interrogations.sort((a, b) => new Date(a.dataInizio).getTime() - new Date(b.dataInizio).getTime());

    return interrogations[0];
  });
}
