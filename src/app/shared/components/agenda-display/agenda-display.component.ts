import { Component, inject, signal, effect, input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonIcon,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  bookOutline, 
  createOutline, 
  documentTextOutline, 
  helpCircleOutline, 
  trashOutline, 
  peopleOutline,
  timeOutline,
  calendarOutline,
  arrowForwardOutline
} from 'ionicons/icons';
import { AgendaEvent } from '../../../pages/agenda/models/agendaEvent';
import { AgendaService } from '../../services/agenda.service';
import { AgendaEventInputComponent } from '../agenda-event-input/agenda-event-input.component';
import { ClassiService } from 'src/app/pages/classes/services/classi.service';

@Component({
  selector: 'app-agenda-display',
  template: `
    <ion-list>
      @for (event of events(); track event) {
        <ion-item-sliding [class.all-day]="event.allDay">
          <ion-item>
            <ion-icon [name]="getIcon(event.type)" slot="start"></ion-icon>
            <ion-label>
              <h2>{{ event.title }}</h2>
              <p>{{ event.description }}</p>
              @if (!classKey() && event.classKey) {
                <p>
                  <ion-note color="medium">Classe: {{ fetchClassName(event.classKey) | async }}</ion-note>
                </p>
              }
            </ion-label>
            <ion-note slot="end" class="event-dates">
              <div>
                @if (!event.allDay) {
                  <ion-icon name="time-outline"></ion-icon>
                }
                @if (event.allDay) {
                  <ion-icon name="calendar-outline"></ion-icon>
                }
                {{ formatDate(event.dataInizio) }}
              </div>
              @if (!isSameDay(event)) {
                <div class="date-range">
                  <ion-icon name="arrow-forward-outline"></ion-icon>
                  {{ formatDate(event.dataFine) }}
                </div>
              }
            </ion-note>
          </ion-item>

          <ion-item-options side="end">
            <ion-item-option color="primary" (click)="editEvent(event)">
              <ion-icon name="create-outline"></ion-icon>
            </ion-item-option>
            <ion-item-option color="danger" (click)="deleteEvent(event)">
              <ion-icon name="trash-outline"></ion-icon>
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      }
      
      @if (events().length === 0) {
        <ion-item>
          <ion-label class="ion-text-center">Nessun evento in agenda</ion-label>
        </ion-item>
      }
    </ion-list>
  `,
  standalone: true,
  imports: [
    CommonModule,
    IonList,
    IonItem,
    IonLabel,
    IonNote,
    IonIcon,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    DatePipe
  ],
  styles: [`
    :host {
      display: block;
    }
    .event-dates {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      font-size: 0.9em;
    }
    .date-range {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.8em;
      color: var(--ion-color-medium);
    }
    ion-item-sliding.all-day ion-item {
      --background: var(--ion-color-light);
    }
  `]
})
export class AgendaDisplayComponent  {
  async fetchClassName(classKey: string) {
  console.log("classKey fetchClassName* ", classKey);
  let classe;
  try {
    classe = await this.$classes.fetchClasse(classKey)
    console.log("classe fetchClassName*  try", classe);
    
  } catch (error) {
    console.error("Errore nella registrazione dell'effect:", error);
  }
  const out = `${classe?.year} ${classe?.classe} ${classe?.descrizione}`
  console.log("out fetchClassName*", out);
  return out
}
  classKey = input<string>();
  teacherKey = input<string>();
  eventsInput = input<AgendaEvent[]>();

  private agendaService = inject(AgendaService);
  private modalCtrl = inject(ModalController);
  private $classes = inject(ClassiService);

  events = signal<AgendaEvent[]>([]);

  constructor() {
    addIcons({ 
      bookOutline, 
      helpCircleOutline, 
      documentTextOutline, 
      createOutline, 
      trashOutline, 
      peopleOutline,
      timeOutline,
      calendarOutline,
      arrowForwardOutline
    });

    // Update events signal when eventsInput changes
    effect(() => {
      const inputEvents = this.eventsInput();
      if (inputEvents) {
        this.events.set(inputEvents);
      
      }
    });
  }





  // Verifica se l'evento si svolge in un solo giorno
  isSameDay(event: AgendaEvent): boolean {
    if (!event.dataInizio || !event.dataFine) return true;
    const start = new Date(event.dataInizio).setHours(0, 0, 0, 0);
    const end = new Date(event.dataFine).setHours(0, 0, 0, 0);
    return start === end;
  }

  // Formatta la data in formato leggibile
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getIcon(type: string) {
    switch (type) {
      case 'homework': return 'book-outline';
      case 'test': return 'help-circle-outline';
      case 'interrogation': return 'people-outline';
      case 'note': return 'document-text-outline';
      default: return 'help-circle-outline';
    }
  }

  private classNamesCache = new Map<string, string>();
  classe = signal("")

  getClassName(classKey: string): string {
    if (!this.classNamesCache.has(classKey)) {
      // Load asynchronously and store in cache
      this.$classes.fetchClasseOnCache(classKey).then(classe => {
        if (classe) {
          this.classNamesCache.set(classKey, `${classe.year} ${classe.classe} ${classe.descrizione}`);
          this.classe.set(`${classe.year} ${classe.classe} ${classe.descrizione}`);

          console.log("classe dell'evednto *",this.classe())
        }
      });
    }
    return this.classNamesCache.get(classKey) || classKey;
  }

  async editEvent(event: AgendaEvent) {
    const modal = await this.modalCtrl.create({
      component: AgendaEventInputComponent,
      componentProps: {
        event,
        classKey: event.classKey,
        teacherKey: event.teacherKey
      }
    });
    await modal.present();
  }

  async deleteEvent(event: AgendaEvent) {
    if (event.key) {
      await this.agendaService.deleteEvent(event.key);
    }
  }
}
