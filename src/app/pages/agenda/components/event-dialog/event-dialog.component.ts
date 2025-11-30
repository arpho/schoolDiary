import { Component, Input, OnInit, inject, ViewChild } from '@angular/core';
import { ModalController, IonDatetime } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AgendaEvent, IAgendaEvent, EventType } from '../../models/agendaEvent';
import { IClasseModel } from 'src/app/pages/classes/models/classModel';

// Estendi il tipo AgendaEvent per gestire i targetClasses come stringhe o oggetti ClasseModel
type ExtendedAgendaEvent = Omit<IAgendaEvent, 'targetClasses'> & {
  targetClasses?: (string | IClasseModel)[];
};

@Component({
  selector: 'app-event-dialog',
  templateUrl: './event-dialog.component.html',
  styleUrls: ['./event-dialog.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class EventDialogComponent implements OnInit {
  /**
   * Gets the class key from a class info object
   * @param classInfo The class info object or string
   * @returns The class key as string
   */
  getClassKey(classInfo: IClasseModel | string): string {
    if (!classInfo) return '';
    if (typeof classInfo === 'string') return classInfo;
    return (classInfo as IClasseModel).key || (classInfo as IClasseModel).id || '';
  }
  private modalCtrl = inject(ModalController);
  
  // Input properties
  @ViewChild('eventForm') eventForm?: NgForm;
  @ViewChild('startDatetime') startDatetime?: IonDatetime;
  @ViewChild('endDatetime') endDatetime?: IonDatetime;

  @Input() eventToEdit: Partial<AgendaEvent> | null = null;
  @Input() targetedClasses: IClasseModel[] = [];
  @Input() classId: string = '';
  @Input() teacherKey: string = '';
  
  // Form model
  event: Partial<ExtendedAgendaEvent> = {
    title: '',
    description: '',
    dataInizio: new Date().toISOString(),
    dataFine: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 ora dopo
    type: 'other',
    classKey: this.classId,
    teacherKey: this.teacherKey,
    allDay: false
  };

  // Available event types
  eventTypes = [
    { value: 'homework', label: 'Compiti' },
    { value: 'test', label: 'Verifica' },
    { value: 'interrogation', label: 'Interrogazione' },
    { value: 'meeting', label: 'Riunione' },
    { value: 'note', label: 'Nota' },
    { value: 'other', label: 'Altro' }
  ];

  // Date constraints
  minDate: string = new Date().toISOString();
  maxDate: string = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString();

  constructor() {}

  ionViewWillEnter() {
    // Set the class key and teacher key if provided
    if (this.classId) {
      this.event.classKey = this.classId;
    }
    if (this.teacherKey) {
      this.event.teacherKey = this.teacherKey;
    }
    
    // Log per debug
    console.log('EventDialogComponent - ionViewWillEnter');
    console.log('event:', JSON.parse(JSON.stringify(this.event)));
    console.log('targetedClasses:', this.targetedClasses);
    console.log('classId:', this.classId);
    console.log('teacherKey:', this.teacherKey);
  }
  
  // Manteniamo ngOnInit per compatibilità
  ngOnInit() {
    this.ionViewWillEnter();
  }

  // Dismiss the modal without saving
  dismiss() {
    this.modalCtrl.dismiss({ saved: false });
  }

  // Save the event and close the modal
  save() {
    if (this.isFormValid()) {
      // Create targetClasses array from the selected classKey
      const targetClasses = this.event.classKey ? [this.event.classKey] : [];

      // Create the event data with proper types
      const eventData: Partial<IAgendaEvent> = {
        ...this.event,
        title: this.event.title?.trim() || '',
        description: this.event.description?.trim() || '',
        dataInizio: this.event.dataInizio || new Date().toISOString(),
        dataFine: this.event.dataFine || new Date().toISOString(),
        type: this.event.type || 'other',
        allDay: this.event.allDay || false,
        targetClasses,
        creationDate: this.event.creationDate || Date.now()
      };
      
      // Create a new AgendaEvent instance with the converted data
      const newEvent = new AgendaEvent(eventData);
      console.log("newEvent", newEvent);  
      
      // Dismiss the modal with the saved event
      this.modalCtrl.dismiss({ 
        saved: true, 
        event: newEvent
      });
    } else {
      // Mark all fields as touched to show validation messages
      this.markFormGroupTouched();
    }
  }

  // Mark all form controls as touched to show validation messages
  private markFormGroupTouched() {
    if (this.eventForm) {
      Object.keys(this.eventForm.controls).forEach(field => {
        const control = this.eventForm?.controls[field];
        control?.markAsTouched();
        control?.updateValueAndValidity();
      });
    }
  }

  // Close the modal without saving
  cancel() {
    this.modalCtrl.dismiss({ saved: false });
  }

  // Handle all day toggle
  onAllDayChange(event: any) {
    this.event.allDay = event.detail.checked;
    if (this.event.allDay && this.event.dataInizio) {
      // Se è un evento di un giorno intero, imposta l'orario a inizio/fine giornata
      const start = new Date(this.event.dataInizio);
      start.setHours(0, 0, 0, 0);
      this.event.dataInizio = start.toISOString();
      
      const end = new Date(this.event.dataInizio);
      end.setHours(23, 59, 59, 999);
      this.event.dataFine = end.toISOString();
    } else if (!this.event.allDay && this.event.dataInizio) {
      // Se non è più un evento di un giorno intero, imposta un orario ragionevole
      const start = new Date(this.event.dataInizio);
      start.setHours(12, 0, 0, 0);
      this.event.dataInizio = start.toISOString();
      
      const end = new Date(start);
      end.setHours(13, 0, 0, 0);
      this.event.dataFine = end.toISOString();
    }
  }

  // Update end date when start date changes
  onStartDateChange() {
    if (!this.event.dataInizio) return;
    
    const startDate = new Date(this.event.dataInizio);
    const endDate = this.event.dataFine ? new Date(this.event.dataFine) : new Date(startDate);
    
    // Se la data di fine è precedente alla data di inizio, aggiorna la data di fine
    if (endDate < startDate) {
      if (this.event.allDay) {
        // Per eventi di un giorno intero, imposta la fine alla mezzanotte del giorno successivo
        const newEndDate = new Date(startDate);
        newEndDate.setDate(newEndDate.getDate() + 1);
        newEndDate.setHours(0, 0, 0, 0);
        this.event.dataFine = newEndDate.toISOString();
      } else {
        // Per eventi con orario, aggiungi 1 ora
        endDate.setTime(startDate.getTime() + 60 * 60 * 1000);
        this.event.dataFine = endDate.toISOString();
      }
    }
  }

  // Handle end date changes
  onEndDateChange() {
    // Verifica che la data di fine sia successiva a quella di inizio
    if (this.event.dataInizio && this.event.dataFine) {
      const startDate = new Date(this.event.dataInizio);
      const endDate = new Date(this.event.dataFine);
      
      if (endDate < startDate) {
        // Se la data di fine è precedente a quella di inizio, ripristina il valore precedente
        this.event.dataFine = this.event.dataInizio;
      }
    }
  }

  // Check if there's a date error (end date before start date)
  hasDateError(): boolean {
    if (!this.event.dataInizio || !this.event.dataFine) return false;
    
    const startDate = new Date(this.event.dataInizio);
    const endDate = new Date(this.event.dataFine);
    
    if (endDate < startDate) {
      // Se la data di fine è precedente a quella di inizio, ripristina il valore precedente
      this.event.dataFine = this.event.dataInizio;
    }
    return true;
  }

  // Handle field changes for validation
  onFieldChange(field: string): void {
    if (this.eventForm) {
      const control = this.eventForm.controls[field];
      if (control) {
        control.markAsTouched();
        control.updateValueAndValidity();
      }
    }
  }

  // Validate form
  isFormValid(): boolean {
    // Check required fields
    if (!this.event.title?.trim()) return false;
    if (!this.event.dataInizio) return false;
    if (!this.event.dataFine) return false;
    
    // Check if end date is after or equal to start date
    const start = new Date(this.event.dataInizio).getTime();
    const end = new Date(this.event.dataFine).getTime();
    
    if (end < start) return false;
    
    // Check if a class is selected
    if (!this.event.classKey) {
      return false;
    }
    
    return true;
  }
}
