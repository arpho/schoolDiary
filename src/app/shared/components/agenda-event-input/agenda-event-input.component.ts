import { Component, Input, inject } from '@angular/core';
import { EventType } from '../../../pages/agenda/models/agendaEvent';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
  IonIcon,
  IonNote,
  IonText
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
      <ion-item [class.ion-invalid]="showErrors && validationErrors['title']" data-field="title">
        <ion-label position="stacked">Titolo <ion-text color="danger">*</ion-text></ion-label>
        <ion-input 
          [(ngModel)]="title" 
          placeholder="Es. Compiti di matematica"
          [class.ion-invalid]="showErrors && validationErrors['title']"
          (ionInput)="clearError('title')">
        </ion-input>
        <ion-note slot="error" *ngIf="showErrors && validationErrors['title']" color="danger">
          {{ validationErrors['title'] }}
        </ion-note>
      </ion-item>
      
      <ion-item>
        <ion-label position="stacked">Descrizione</ion-label>
        <ion-textarea [(ngModel)]="description" placeholder="Dettagli..."></ion-textarea>
      </ion-item>

      <ion-item>
        <ion-label>Tutto il giorno</ion-label>
        <ion-toggle [(ngModel)]="allDay" (ionChange)="onAllDayChange()"></ion-toggle>
      </ion-item>

      <ion-item [class.ion-invalid]="showErrors && validationErrors['dataInizio']" data-field="dataInizio">
        <ion-label>Data inizio <ion-text color="danger">*</ion-text></ion-label>
        <ion-datetime-button datetime="start"></ion-datetime-button>
        <ion-modal [keepContentsMounted]="true">
          <ng-template>
            <ion-datetime 
              id="start" 
              [(ngModel)]="dataInizio" 
              presentation="date-time" 
              showDefaultButtons="true"
              (ionChange)="onStartDateChange($event)">
              <span slot="title">Seleziona data e ora di inizio</span>
            </ion-datetime>
          </ng-template>
        </ion-modal>
        <ion-note slot="error" *ngIf="showErrors && validationErrors['dataInizio']" color="danger">
          {{ validationErrors['dataInizio'] }}
        </ion-note>
      </ion-item>

      <ion-item [class.ion-invalid]="showErrors && validationErrors['dataFine']" data-field="dataFine">
        <ion-label>Data fine <ion-text color="danger">*</ion-text></ion-label>
        <ion-datetime-button datetime="end"></ion-datetime-button>
        <ion-modal [keepContentsMounted]="true">
          <ng-template>
            <ion-datetime 
              id="end" 
              [(ngModel)]="dataFine" 
              presentation="date-time" 
              showDefaultButtons="true"
              (ionChange)="onEndDateChange($event)">
              <span slot="title">Seleziona data e ora di fine</span>
            </ion-datetime>
          </ng-template>
        </ion-modal>
        <ion-note slot="error" *ngIf="showErrors && validationErrors['dataFine']" color="danger">
          {{ validationErrors['dataFine'] }}
        </ion-note>
      </ion-item>

      <ion-item [class.ion-invalid]="showErrors && validationErrors['type']" data-field="type">
        <ion-label>Tipo evento <ion-text color="danger">*</ion-text></ion-label>
        <ion-select 
          [(ngModel)]="type" 
          placeholder="Seleziona tipo"
          [class.ion-invalid]="showErrors && validationErrors['type']"
          (ionChange)="clearError('type')">
          <ion-select-option value="homework">Compiti</ion-select-option>
          <ion-select-option value="test">Verifica</ion-select-option>
          <ion-select-option value="interrogation">Interrogazione</ion-select-option>
          <ion-select-option value="note">Nota</ion-select-option>
          <ion-select-option value="meeting">Riunione</ion-select-option>
          <ion-select-option value="other">Altro</ion-select-option>
        </ion-select>
        <ion-note slot="error" *ngIf="showErrors && validationErrors['type']" color="danger">
          {{ validationErrors['type'] }}
        </ion-note>
      </ion-item>

      <ion-button expand="block" class="ion-margin-top" (click)="save()" [disabled]="!validateForm().isValid">
        <ion-icon slot="start" name="save"></ion-icon>
        Salva
      </ion-button>

      <!-- Area errori -->
      <div *ngIf="showErrors && getErrorKeys().length > 0" class="error-container ion-margin-top">
        <ion-text color="danger">
          <h4>Si sono verificati i seguenti errori:</h4>
          <ul class="error-list">
            <li *ngFor="let key of getErrorKeys()">
              <ion-icon name="warning" color="danger"></ion-icon> {{ validationErrors[key] }}
            </li>
          </ul>
        </ion-text>
      </div>
    </ion-content>
  `,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
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
    IonIcon,
    IonNote,
    IonText
  ] as any[],
  styles: [`
    .time-icon {
      margin-right: 8px;
    }
    
    ion-note {
      display: block;
      margin-top: 5px;
      font-size: 0.9em;
    }
    
    ion-item.ion-invalid {
      --highlight-color-focused: var(--ion-color-danger);
      --highlight-color-valid: var(--ion-color-danger);
    }
    
    ion-input.ion-invalid,
    ion-select.ion-invalid {
      --highlight-color: var(--ion-color-danger);
      --highlight-color-focused: var(--ion-color-danger);
    }
    
    .error-container {
      background-color: var(--ion-color-light);
      border-left: 4px solid var(--ion-color-danger);
      padding: 12px;
      margin: 16px 0;
      border-radius: 4px;
    }
    
    .error-list {
      margin: 8px 0 0 0;
      padding-left: 24px;
    }
    
    .error-list li {
      margin: 8px 0;
      display: flex;
      align-items: center;
    }
    
    .error-list ion-icon {
      margin-right: 8px;
    }
  `]
})
export class AgendaEventInputComponent {
  @Input() event?: AgendaEvent;
  @Input() classKey: string = '';
  @Input() teacherKey: string = '';

  validationErrors: { [key: string]: string } = {};
  showErrors = false;

  private modalCtrl = inject(ModalController);
  private agendaService = inject(AgendaService);

  title = '';
  description = '';
  dataInizio = new Date().toISOString();
  dataFine = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 ora dopo
  allDay = false;
  type: EventType = 'homework';
  minDate = new Date().toISOString();
  maxDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString();

  ngOnInit() {
    addIcons({ calendarOutline, timeOutline });
    
    // Validate form on initialization
    this.updateValidation();
  }

  // ...

  onAllDayChange() {
    if (this.allDay) {
      // Se si passa a "Tutto il giorno", imposta l'ora a mezzanotte
      const startDate = new Date(this.dataInizio);
      startDate.setHours(0, 0, 0, 0);
      this.dataInizio = startDate.toISOString();
      
      const endDate = new Date(this.dataFine);
      endDate.setHours(23, 59, 59, 999);
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

  validateForm(): { isValid: boolean; errors: { [key: string]: string } } {
    const errors: { [key: string]: string } = {};
    
    if (!this.title?.trim()) {
      errors['title'] = 'Il titolo è obbligatorio';
      console.log('Titolo obbligatorio');
    }
    
    if (!this.dataInizio) {
      errors['dataInizio'] = 'La data di inizio è obbligatoria';
      console.log('Data inizio obbligatoria');
    }
    
    if (!this.dataFine) {
      errors['dataFine'] = 'La data di fine è obbligatoria';
      console.log('Data fine obbligatoria');
    } else if (this.dataInizio && new Date(this.dataInizio) > new Date(this.dataFine)) {
      errors['dataFine'] = 'La data di fine non può essere precedente alla data di inizio';
      console.log('Data fine non può essere precedente alla data di inizio');
    }
    
    if (!this.type) {
      errors['type'] = 'Il tipo di evento è obbligatorio';
      console.log('Tipo evento obbligatorio');
    }
    
    if (!this.classKey) {
      errors['classKey'] = 'Seleziona una classe';
      console.log('Classe obbligatoria');
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
  
  private showErrorMessages(errors: { [key: string]: string }) {
    this.validationErrors = errors;
    this.showErrors = true;
    
    // Scroll al primo campo con errore
    const firstError = Object.keys(errors)[0];
    if (firstError) {
      const element = document.querySelector(`[data-field="${firstError}"]`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // Gestisce il cambio della data di inizio
  onStartDateChange(event: any) {
    this.dataInizio = event.detail.value;
    this.clearError('dataInizio');
    
    // Se la data di fine è precedente alla nuova data di inizio, aggiorniamo anche quella
    if (this.dataInizio && this.dataFine && new Date(this.dataInizio) > new Date(this.dataFine)) {
      const newEndDate = new Date(this.dataInizio);
      newEndDate.setHours(newEndDate.getHours() + 1); // Aggiungi 1 ora
      this.dataFine = newEndDate.toISOString();
    }
    
    // Update validation on change
    this.updateValidation();
  }
  
  // Gestisce il cambio della data di fine
  onEndDateChange(event: any) {
    this.dataFine = event.detail.value;
    this.clearError('dataFine');
    this.updateValidation();
  }
  
  // Updates validation state for the form
  private updateValidation() {
    const { errors } = this.validateForm();
    this.validationErrors = errors;
    this.showErrors = Object.keys(errors).length > 0;
  }

  // Clears error for a specific field and updates validation
  clearError(field: string) {
    if (this.validationErrors[field]) {
      delete this.validationErrors[field];
      this.showErrors = this.getErrorKeys().length > 0;
    }
    // Re-validate the form to update error states
    this.updateValidation();
  }

  // Restituisce un array con le chiavi degli errori
  getErrorKeys(): string[] {
    return Object.keys(this.validationErrors).filter(key => this.validationErrors[key]);
  }


  
  async save() {
    const { isValid, errors } = this.validateForm();
    this.showErrors = !isValid;
    if (!isValid) {
      this.showErrorMessages(errors);
      return;
    }

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
