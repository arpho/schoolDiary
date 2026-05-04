import { Component, Input, inject, signal, OnInit } from '@angular/core';
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
  IonSelect,
  IonSelectOption,
  IonButton,
  IonButtons,
  ModalController,
  IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { saveOutline, closeOutline } from 'ionicons/icons';
import { GroupModel } from '../../../models/groupModel';
import { SubjectModel } from 'src/app/pages/subjects-list/models/subjectModel';

/**
 * Modale per la creazione e modifica di un gruppo.
 * Supporta una modalità "solo impostazioni" per modifiche rapide di materia e note.
 * Utilizza Angular Signals per la gestione reattiva del form.
 */
@Component({
  selector: 'app-group-edit-modal',
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
    IonSelect,
    IonSelectOption,
    IonButton,
    IonButtons,
    IonIcon
  ],
  template: `
    <ion-header>
      <ion-toolbar [color]="showOnlySettings ? 'tertiary' : 'primary'">
        <ion-title>{{ showOnlySettings ? 'Impostazioni Gruppo' : (group ? 'Modifica Gruppo' : 'Nuovo Gruppo') }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">
            <ion-icon name="close-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="form-container">
        <ion-item lines="none" class="ion-margin-bottom">
          <ion-label position="stacked">Nome del gruppo</ion-label>
          <ion-input 
            [value]="nome()" 
            (ionInput)="nome.set($any($event).detail.value)"
            placeholder="Es. Gruppo A"
            type="text">
          </ion-input>
        </ion-item>

        @if (!showOnlySettings) {
          <ion-item lines="none" class="ion-margin-bottom">
            <ion-label position="stacked">Descrizione</ion-label>
            <ion-textarea 
              [value]="description()" 
              (ionInput)="description.set($any($event).detail.value)"
              placeholder="Inserisci una descrizione..."
              [autoGrow]="true">
            </ion-textarea>
          </ion-item>
        }

        <ion-item lines="none" class="ion-margin-bottom">
          <ion-label position="stacked">Materia associata</ion-label>
          <ion-select 
            [value]="subjectKey()" 
            (ionChange)="subjectKey.set($event.detail.value)"
            placeholder="Seleziona una materia (opzionale)"
            interface="popover">
            <ion-select-option value="">Nessuna materia</ion-select-option>
            @for (subject of subjects; track subject.key) {
              <ion-select-option [value]="subject.key">
                {{ subject.name }}
              </ion-select-option>
            }
          </ion-select>
        </ion-item>

        <ion-item lines="none" class="ion-margin-bottom">
          <ion-label position="stacked">Note sul gruppo</ion-label>
          <ion-textarea 
            [value]="note()" 
            (ionInput)="note.set($any($event).detail.value)"
            placeholder="Aggiungi note specifiche..."
            [autoGrow]="true"
            rows="4">
          </ion-textarea>
        </ion-item>

        <div class="ion-padding-top">
          <ion-button expand="block" (click)="save()" [disabled]="!nome().trim()" mode="ios" [color]="showOnlySettings ? 'tertiary' : 'primary'" class="save-button">
            <ion-icon slot="start" name="save-outline"></ion-icon>
            {{ showOnlySettings ? 'Applica Modifiche' : 'Salva Gruppo' }}
          </ion-button>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .form-container {
      max-width: 500px;
      margin: 0 auto;
    }
    ion-item {
      --border-radius: 8px;
      --padding-start: 12px;
      margin-bottom: 16px;
      border: 1px solid var(--ion-color-light-shade);
      border-radius: 8px;
      background: var(--ion-color-light-tint);
    }
    ion-label {
      font-weight: 600;
      margin-bottom: 8px;
    }
    .save-button {
      --border-radius: 12px;
      font-weight: 600;
      height: 50px;
    }
  `]
})
export class GroupEditModalComponent implements OnInit {
  // Input tramite decoratore standard per compatibilità con ModalController componentProps
  @Input() group?: GroupModel;
  @Input() subjects: SubjectModel[] = [];
  @Input() showOnlySettings: boolean = false;

  // Segnali interni per lo stato del form
  nome = signal('');
  description = signal('');
  subjectKey = signal('');
  note = signal('');

  private modalCtrl = inject(ModalController);

  constructor() {
    addIcons({ saveOutline, closeOutline });
  }

  /**
   * Inizializzazione dati dai decoratori @Input()
   */
  ngOnInit() {
    if (this.group) {
      this.nome.set(this.group.nome || '');
      this.description.set(this.group.description || '');
      this.subjectKey.set(this.group.subjectKey || '');
      this.note.set(this.group.note || '');
    }
  }

  /**
   * Chiude il modale senza salvare.
   */
  dismiss() {
    this.modalCtrl.dismiss();
  }

  /**
   * Chiude il modale restituendo i dati aggiornati.
   */
  save() {
    this.modalCtrl.dismiss({
      nome: this.nome(),
      description: this.description(),
      subjectKey: this.subjectKey(),
      note: this.note()
    }, 'confirm');
  }
}
