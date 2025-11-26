import { Component, inject, signal, effect, input } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { bookOutline, createOutline, documentTextOutline, helpCircleOutline, trashOutline, peopleOutline } from 'ionicons/icons';
import { AgendaEvent } from '../../../pages/agenda/models/agendaEvent';
import { AgendaService } from '../../services/agenda.service';
import { AgendaEventInputComponent } from '../agenda-event-input/agenda-event-input.component';
import { ClassiService } from 'src/app/pages/classes/services/classi.service';

@Component({
  selector: 'app-agenda-display',
  template: `
    <ion-list>
      <ion-item-sliding *ngFor="let event of events()">
        <ion-item>
          <ion-icon [name]="getIcon(event.type)" slot="start"></ion-icon>
          <ion-label>
            <h2>{{ event.title }}</h2>
            <p>{{ event.description }}</p>
            <p *ngIf="!classKey() && event.classKey">
              <ion-note color="medium">Classe: {{ getClassName(event.classKey) }}</ion-note>
            </p>
          </ion-label>
          <ion-note slot="end">{{ event.date | date:'shortDate' }}</ion-note>
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
      
      <ion-item *ngIf="events().length === 0">
        <ion-label class="ion-text-center">Nessun evento in agenda</ion-label>
      </ion-item>
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
    IonItemOption
  ]
})
export class AgendaDisplayComponent {
  classKey = input<string>();
  teacherKey = input<string>();
  eventsInput = input<AgendaEvent[]>();

  private agendaService = inject(AgendaService);
  private modalCtrl = inject(ModalController);
  private classService = inject(ClassiService);

  events = signal<AgendaEvent[]>([]);

  constructor() {
    addIcons({ bookOutline, helpCircleOutline, documentTextOutline, createOutline, trashOutline, peopleOutline });

    // Update events signal when eventsInput changes
    effect(() => {
      const inputEvents = this.eventsInput();
      if (inputEvents) {
        this.events.set(inputEvents);
      }
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

  getClassName(classKey: string): string {
    if (!this.classNamesCache.has(classKey)) {
      // Load asynchronously and store in cache
      this.classService.fetchClasseOnCache(classKey).then(classe => {
        if (classe) {
          this.classNamesCache.set(classKey, `${classe.year} ${classe.classe} ${classe.descrizione}`);
        }
      });
      return classKey; // Return key temporarily while loading
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
