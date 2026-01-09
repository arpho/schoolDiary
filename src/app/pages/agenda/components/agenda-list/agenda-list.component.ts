import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonList,
  IonListHeader,
  IonItem,
  IonLabel
} from '@ionic/angular/standalone';
import { AgendaEvent } from '../../models/agendaEvent';
import { AgendaDisplayComponent } from 'src/app/shared/components/agenda-display/agenda-display.component';

/**
 * Componente per la visualizzazione a lista degli eventi in agenda.
 * Utilizza `AgendaDisplayComponent` per renderizzare ogni singolo evento.
 */
@Component({
  selector: 'app-agenda-list',
  templateUrl: './agenda-list.component.html',
  styleUrls: ['./agenda-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    IonList,
    IonListHeader,
    IonItem,
    IonLabel,
    AgendaDisplayComponent
  ]
})
export class AgendaListComponent {
  events = input.required<AgendaEvent[]>();
  title = input<string>('');

  emptyMessage = computed(() => 'Nessun evento in agenda');
}
