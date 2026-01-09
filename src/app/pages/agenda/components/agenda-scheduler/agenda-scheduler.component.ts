import { Component, ChangeDetectionStrategy, input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgendaEvent } from '../../models/agendaEvent';
import { IonText, IonDatetime, IonList, IonItem, IonLabel, IonNote, IonIcon } from '@ionic/angular/standalone';
import { AgendaDisplayComponent } from 'src/app/shared/components/agenda-display/agenda-display.component';

/**
 * Componente scheduler per l'agenda.
 * Mostra un calendario interattivo e la lista degli eventi del giorno selezionato.
 */
@Component({
  selector: 'app-agenda-scheduler',
  templateUrl: './agenda-scheduler.component.html',
  styleUrls: ['./agenda-scheduler.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    IonDatetime,
    IonList,
    IonItem,
    IonLabel,
    IonText,
    IonNote,
    IonIcon,
    AgendaDisplayComponent
  ]
})
export class AgendaSchedulerComponent {
  events = input.required<AgendaEvent[]>();

  selectedDate = signal<string>(new Date().toISOString());

  highlightedDates = computed(() => {
    const dates: { date: string, textColor: string, backgroundColor: string }[] = [];
    const eventsList = this.events();

    // Create a Set of unique dates with events
    const uniqueDates = new Set(eventsList.map(e => {
      return e.dataInizio.split('T')[0];
    }));

    uniqueDates.forEach(date => {
      dates.push({
        date: date,
        textColor: 'var(--ion-color-primary-contrast)',
        backgroundColor: 'var(--ion-color-primary)'
      });
    });

    return dates;
  });

  filteredEvents = computed(() => {
    const selected = this.selectedDate().split('T')[0];
    return this.events().filter(e => e.dataInizio.startsWith(selected));
  });

  onDateChange(event: any) {
    this.selectedDate.set(event.detail.value);
  }
}
