import { Component, Input, inject, signal } from '@angular/core';
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
  IonModal
} from '@ionic/angular/standalone';
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
        <ion-label position="stacked">Data</ion-label>
        <ion-datetime-button datetime="datetime"></ion-datetime-button>
        <ion-modal [keepContentsMounted]="true">
          <ng-template>
            <ion-datetime id="datetime" presentation="date" [(ngModel)]="date"></ion-datetime>
          </ng-template>
        </ion-modal>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">Tipo</ion-label>
        <ion-select [(ngModel)]="type">
          <ion-select-option value="homework">Compiti</ion-select-option>
          <ion-select-option value="test">Verifica</ion-select-option>
          <ion-select-option value="interrogation">Interrogazione</ion-select-option>
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
    IonModal
  ]
})
export class AgendaEventInputComponent {
  @Input() event?: AgendaEvent;
  @Input() classKey!: string;
  @Input() teacherKey!: string;

  private modalCtrl = inject(ModalController);
  private agendaService = inject(AgendaService);

  title = '';
  description = '';
  date = new Date().toISOString();
  type: 'homework' | 'test' | 'interrogation' | 'note' | 'other' = 'homework';

  ngOnInit() {
    if (this.event) {
      this.title = this.event.title;
      this.description = this.event.description || '';
      this.date = this.event.date;
      this.type = this.event.type;
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  isValid(): boolean {
    return !!this.title && !!this.date;
  }

  async save() {
    if (!this.isValid()) return;

    const eventData = new AgendaEvent({
      key: this.event?.key,
      title: this.title,
      description: this.description,
      date: this.date,
      type: this.type,
      classKey: this.classKey,
      teacherKey: this.teacherKey,
      creationDate: this.event?.creationDate
    });

    try {
      if (this.event && this.event.key) {
        await this.agendaService.updateEvent(eventData);
      } else {
        await this.agendaService.addEvent(eventData);
      }
      this.modalCtrl.dismiss(eventData, 'confirm');
    } catch (error) {
      console.error('Error saving event', error);
    }
  }
}
