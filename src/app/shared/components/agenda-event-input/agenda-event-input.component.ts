import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonDatetime,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonButtons,
  ModalController,
  IonDatetimeButton,
  IonModal,
  IonToggle,
  IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, timeOutline } from 'ionicons/icons';
import { AgendaEvent } from '../../../pages/agenda/models/agendaEvent';
import { AgendaService } from '../../services/agenda.service';

@Component({
  selector: 'app-agenda-event-input',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ event ? 'Modifica Evento' : 'Nuovo Evento' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">Annulla</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-item>
        <ion-label position="stacked">Titolo</ion-label>
        <ion-input [(ngModel)]="title" placeholder="Es. Compiti di matematica"></ion-input>
      </ion-item>
      
      <ion-item>
        <ion-label position="stacked">Descrizione</ion-label>
        <ion-textarea [(ngModel)]="description" placeholder="Dettagli..."></ion-textarea>
      </ion-item>

      <ion-item>
        <ion-label>Tutto il giorno</ion-label>
        <ion-toggle [(ngModel)]="allDay" (ionChange)="onAllDayChange()"></ion-toggle>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Data e ora inizio</ion-label>
        <ion-datetime-button datetime="startDatetime"></ion-datetime-button>
        <ion-modal [keepContentsMounted]="true">
          <ng-template>
            <ion-datetime 
              id="startDatetime" 
              [presentation]="allDay ? 'date' : 'date-time'" 
              [(ngModel)]="dataInizio"
              [min]="minDate"
              [max]="maxDate">
            </ion-datetime>
          </ng-template>
        </ion-modal>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Data e ora fine</ion-label>
        <ion-datetime-button datetime="endDatetime"></ion-datetime-button>
        <ion-modal [keepContentsMounted]="true">
          <ng-template>
            <ion-datetime 
              id="endDatetime" 
              [presentation]="allDay ? 'date' : 'date-time'" 
              [(ngModel)]="dataFine"
              [min]="minDate"
              [max]="maxDate">
            </ion-datetime>
          </ng-template>
        </ion-modal>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Tipo</ion-label>
        <ion-select [(ngModel)]="type">
          <ion-select-option value="homework">Compiti</ion-select-option>
          <ion-select-option value="test">Verifica</ion-select-option>
          <ion-select-option value="interrogation">Interrogazione</ion-select-option>
          <ion-select-option value="meeting">Riunione</ion-select-option>
          <ion-select-option value="note">Nota</ion-select-option>
          <ion-select-option value="other">Altro</ion-select-option>
        </ion-select>
      </ion-item>

      <ion-button expand="block" class="ion-margin-top" (click)="save()" [disabled]="!isValid()">
        Salva
      </ion-button>
    </ion-content>
  `,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonDatetime,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonButtons,
    IonDatetimeButton,
    IonModal,
    IonToggle,
    IonIcon
  ],
  styles: [`
    .time-icon {
      margin-right: 8px;
      color: var(--ion-color-medium);
    }
  `]
})
export class AgendaEventInputComponent {
  @Input() event?: AgendaEvent;
  @Input() classKey!: string;
  @Input() teacherKey!: string;

  private modalCtrl = inject(ModalController);
  private agendaService = inject(AgendaService);

  title = '';
  description = '';
  dataInizio = new Date().toISOString();
  dataFine = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 ora dopo
  allDay = false;
  type: 'homework' | 'test' | 'interrogation' | 'note' | 'meeting' | 'other' = 'homework';
  minDate = new Date().toISOString();
  maxDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString();

  constructor() {
    addIcons({ calendarOutline, timeOutline });
  }

  ngOnInit() {
    if (this.event) {
      this.title = this.event.title;
      this.description = this.event.description || '';
      this.dataInizio = this.event.dataInizio || new Date().toISOString();
      this.dataFine = this.event.dataFine || new Date(Date.now() + 60 * 60 * 1000).toISOString();
      this.allDay = this.event.allDay || false;
      this.type = this.event.type;
    }
  }

  onAllDayChange() {
    if (this.allDay) {
      // Se è tutto il giorno, impostiamo l'orario a mezzanotte
      const startDate = new Date(this.dataInizio);
      startDate.setHours(0, 0, 0, 0);
      this.dataInizio = startDate.toISOString();
      
      const endDate = new Date(this.dataInizio);
      endDate.setDate(endDate.getDate() + 1); // Fine alla mezzanotte successiva
      endDate.setHours(0, 0, 0, 0);
      this.dataFine = endDate.toISOString();
    } else {
      // Se non è tutto il giorno, impostiamo un orario di default (es. 1 ora dopo)
      const startDate = new Date(this.dataInizio);
      startDate.setHours(12, 0, 0, 0); // Mezzogiorno
      this.dataInizio = startDate.toISOString();
      
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 ora dopo
      this.dataFine = endDate.toISOString();
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  isValid(): boolean {
    return !!this.title && !!this.dataInizio && !!this.dataFine && !!this.type && !!this.classKey && !!this.teacherKey;
  }

  async save() {
    if (!this.isValid()) return;

    const eventData = new AgendaEvent({
      key: this.event?.key,
      title: this.title,
      description: this.description,
      dataInizio: this.dataInizio,
      dataFine: this.dataFine,
      allDay: this.allDay,
      type: this.type,
      classKey: this.classKey,
      teacherKey: this.teacherKey,
      creationDate: this.event?.creationDate || Date.now()
    });

    try {
      if (this.event && this.event.key) {
        await this.agendaService.updateEvent(eventData);
      } else {
        await this.agendaService.addEvent(eventData);
      }
      this.modalCtrl.dismiss(eventData, 'confirm');
    } catch (error) {
      console.error('Errore durante il salvataggio dell\'evento', error);
    }
  }
}
