import { Component, inject, signal, effect, input, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  AlertController,
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
  arrowForwardOutline,
  checkmarkCircleOutline,
  checkmarkDoneOutline,
  closeCircleOutline,
  eyeOutline,
  micOutline
} from 'ionicons/icons';
import { AgendaEvent } from '../../../pages/agenda/models/agendaEvent';
import { AgendaService } from '../../services/agenda.service';
import { AgendaEventInputComponent } from '../agenda-event-input/agenda-event-input.component';
import { ClassiService } from 'src/app/pages/classes/services/classi.service';
import { ClasseModel } from 'src/app/pages/classes/models/classModel';


/**
 * Componente per la visualizzazione della lista di eventi agenda.
 * Permette di vedere i dettagli, segnare come completato, modificare ed eliminare eventi.
 */
@Component({
  selector: 'app-agenda-display',
  template: `
    <ion-list>
      @for (event of events(); track event) {
        <ion-item-sliding [class.all-day]="event.allDay">
          <ion-item>
            <ion-icon [name]="getIcon(event.type)" slot="start"></ion-icon>
            <ion-label>
              <h2 [class.completed]="event.done">
                {{ event.title }}
                @if (event.done) {
                  <ion-icon name="checkmark-done-outline" color="success"></ion-icon>
                }
              </h2>
              <p>{{ event.description }}</p>
              @if (!classKey() && event.classKey) {
                <p>
                  <ion-note color="medium">Classe: {{ fetchClassName(event.classKey) }}</ion-note>
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
            <ion-item-option 
              [color]="event.done ? 'medium' : 'success'" 
              (click)="toggleDone(event)">
              <ion-icon 
                [name]="event.done ? 'close-circle-outline' : 'checkmark-circle-outline'"
                [color]="event.done ? 'medium' : 'success'">
              </ion-icon>
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
    .completed {
      text-decoration: line-through;
      color: var(--ion-color-medium);
      opacity: 0.8;
    }
    ion-item-sliding.all-day ion-item {
      --background: var(--ion-color-light);
    }
  `]
})
export class AgendaDisplayComponent implements OnInit {
  classCache = new Map<string, ClasseModel>();
  fetchClassName(classKey: string) {
    const classe = this.classCache.get(classKey);
    return `${classe?.year} ${classe?.classe}`
  }
  /** Chiave della classe per filtrare (opzionale) */
  classKey = input<string>();
  /** Chiave del docente (opzionale) */
  teacherKey = input<string>();
  /** Lista di eventi da visualizzare (input signal) */
  eventsInput = input<AgendaEvent[]>();

  private agendaService = inject(AgendaService)
  private modalCtrl = inject(ModalController)
  private alertCtrl = inject(AlertController)
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
      eyeOutline,
      calendarOutline,
      arrowForwardOutline,
      micOutline,
      'checkmark-circle-outline': checkmarkCircleOutline,
      'checkmark-done-outline': checkmarkDoneOutline,
      'close-circle-outline': closeCircleOutline,
    });

    // Update events signal when eventsInput changes
    effect(() => {
      const inputEvents = this.eventsInput();
      if (inputEvents) {
        this.events.set(inputEvents);

      }
    });
  }
  ngOnInit(): void {
    const classes = this.$classes.getAllClasses();
    this.classCache = new Map(classes.map((classe) => [classe.key, classe]));
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
      case 'interrogation': return 'mic-outline';
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
          this.classe.set(`${classe.year} ${classe.classe} `);
        }
      });
    }
    return this.classNamesCache.get(classKey) || classKey;
  }

  /**
   * Apre il modale per la modifica di un evento.
   * @param event L'evento da modificare.
   */
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

  /**
   * Richiede conferma e poi elimina l'evento.
   * @param event L'evento da eliminare.
   */
  async deleteEvent(event: AgendaEvent) {
    if (!event.key) return;

    const alert = await this.alertCtrl.create({
      header: 'Conferma eliminazione',
      message: 'Sei sicuro di voler eliminare questo evento?',
      buttons: [
        {
          text: 'Annulla',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Elimina',
          handler: async () => {
            try {
              await this.agendaService.deleteEvent(event.key!);
            } catch (error) {
              console.error('Errore durante l\'eliminazione dell\'evento:', error);
              const errorAlert = await this.alertCtrl.create({
                header: 'Errore',
                message: 'Si è verificato un errore durante l\'eliminazione dell\'evento.',
                buttons: ['OK']
              });
              await errorAlert.present();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Inverte lo stato di completamento dell'evento (fatto/da fare).
   * @param event L'evento da aggiornare.
   */
  async toggleDone(event: AgendaEvent) {
    if (!event.key) return;

    try {
      // Toggle the done status
      event.done = !event.done;
      // Update the event in the database
      await this.agendaService.updateEvent(event);
    } catch (error) {
      console.error('Errore durante l\'aggiornamento dello stato dell\'evento:', error);
      // Revert the change in case of error
      event.done = !event.done;

      const errorAlert = await this.alertCtrl.create({
        header: 'Errore',
        message: 'Si è verificato un errore durante l\'aggiornamento dello stato dell\'evento.',
        buttons: ['OK']
      });
      await errorAlert.present();
    }
  }
}
