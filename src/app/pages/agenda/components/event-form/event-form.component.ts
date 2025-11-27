import { Component, OnInit, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { IonicModule, ModalController, NavParams } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { close, save } from 'ionicons/icons';
import { IonDatetime } from '@ionic/angular';
import { defineCustomElements } from '@ionic/core/loader';

type CustomDatetimeEvent = CustomEvent<{ value?: string | string[] | null }>;

type DatetimeType = 'start' | 'end';

interface DatetimeValue {
  type: DatetimeType;
  value: string;
}

// Interfaccia per i dati dell'evento
export interface EventData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  classId: string;
  classInfo?: any;
}

@Component({
  selector: 'app-event-form',
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule
  ]
})
export class EventFormComponent implements OnInit {

  @ViewChild('startDatetime') startDatetime: IonDatetime | undefined;
  @ViewChild('endDatetime') endDatetime: IonDatetime | undefined;

  eventForm!: FormGroup;
  isEditMode = false;

  minDate: string = '';
  maxDate: string = '';
  currentDatetime: DatetimeValue | null = null;

  // Proprietà per la gestione del form
  readonly MAX_TITLE_LENGTH = 100;
  readonly MAX_DESCRIPTION_LENGTH = 500;

  constructor(
    private formBuilder: FormBuilder,
    private modalCtrl: ModalController,
    private navParams: NavParams
  ) {
    // Add icons
    addIcons({ close, save });

    // Imposta le date minime e massime (es. da oggi a 1 anno da oggi)
    const today = new Date();
    this.minDate = today.toISOString();

    const nextYear = new Date();
    nextYear.setFullYear(today.getFullYear() + 1);
    this.maxDate = nextYear.toISOString();

    // Inizializza il form
    this.initializeForm();

    // Initialize Ionic custom elements
    defineCustomElements(window);
  }

  ngOnInit() {
    // Se stai modificando un evento esistente, popola il form
    const eventData = this.navParams.get('eventData');
    if (eventData) {
      this.isEditMode = true;
      this.eventForm.patchValue({
        ...eventData,
        startDate: this.formatDateForInput(eventData.startDate),
        endDate: this.formatDateForInput(eventData.endDate)
      });
    }
  }

  private initializeForm() {
    const now = new Date();
    // Arrotonda ai 15 minuti più vicini
    now.setMinutes(Math.floor(now.getMinutes() / 15) * 15, 0, 0);

    const endDate = new Date(now);
    endDate.setHours(now.getHours() + 1); // Imposta la fine a 1 ora dopo l'inizio

    // Ottieni i parametri dal NavParams
    const classId = this.navParams.get('classId');
    const classInfo = this.navParams.get('classInfo');
    const eventData = this.navParams.get('eventData');

    this.eventForm = this.formBuilder.group({
      title: [
        eventData?.title || '',
        [
          Validators.required,
          Validators.maxLength(this.MAX_TITLE_LENGTH)
        ]
      ],
      description: [
        eventData?.description || '',
        [
          Validators.maxLength(this.MAX_DESCRIPTION_LENGTH)
        ]
      ],
      startDate: [
        eventData?.startDate ? new Date(eventData.startDate).toISOString() : now.toISOString(),
        [Validators.required]
      ],
      endDate: [
        eventData?.endDate ? new Date(eventData.endDate).toISOString() : endDate.toISOString(),
        [Validators.required]
      ],
      allDay: [eventData?.allDay || false],
      classId: [classId || '', Validators.required],
      classInfo: [classInfo || {}]
    });

    // Aggiorna automaticamente la data di fine se quella di inizio cambia
    this.eventForm.get('startDate')?.valueChanges.subscribe(startDate => {
      if (startDate) {
        const start = new Date(startDate);
        const end = new Date(start.getTime() + (60 * 60 * 1000)); // +1 ora
        this.eventForm.get('endDate')?.setValue(end.toISOString(), { emitEvent: false });
      }
    });
  }

  private formatDateForInput(dateString: string | Date): string {
    const date = new Date(dateString);
    return date.toISOString();
  }

  /**
   * Gestisce il cambio della data/ora di inizio
   * @param event L'evento di cambio data/ora
   */
  async onStartDateChange(event: CustomDatetimeEvent) {
    const startDate = new Date(event.detail.value as string);

    // Se non è in modalità tutto il giorno, aggiorna la data di fine
    if (!this.eventForm.get('allDay')?.value) {
      const endDate = new Date(startDate.getTime() + (60 * 60 * 1000)); // +1 ora
      this.eventForm.patchValue({
        endDate: endDate.toISOString()
      }, { emitEvent: false });
    }
  }

  /**
   * Gestisce il cambio della data/ora di fine
   * @param event L'evento di cambio data/ora
   */
  onEndDateChange(event: any) {
    const value = event.detail.value;
    if (!value) return;

    const endDate = new Date(value);
    const startDate = new Date(this.eventForm.get('startDate')?.value);

    // Assicura che la data di fine sia successiva alla data di inizio
    if (endDate < startDate) {
      // Se la data di fine è precedente a quella di inizio, la imposta a 1 ora dopo l'inizio
      const newEndDate = new Date(startDate);
      newEndDate.setHours(startDate.getHours() + 1);

      this.eventForm.patchValue({
        endDate: newEndDate.toISOString()
      });
    }
  }

  /**
   * Gestisce il cambio della modalità tutto il giorno
   * @param event L'evento di cambio toggle
   */
  onAllDayChange(event: any) {
    const allDay = event.detail.checked;
    const startDate = new Date(this.eventForm.get('startDate')?.value || new Date());

    if (allDay) {
      // Imposta l'ora a mezzanotte per l'evento di tutto il giorno
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 1); // Fine a mezzanotte del giorno successivo

      this.eventForm.patchValue({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }, { emitEvent: false });
    } else {
      // Se si disattiva la modalità tutto il giorno, imposta una durata predefinita di 1 ora
      const endDate = new Date(startDate);
      endDate.setHours(startDate.getHours() + 1);

      this.eventForm.patchValue({
        endDate: endDate.toISOString()
      }, { emitEvent: false });
    }
  }

  async onSubmit() {
    if (this.eventForm.valid) {
      try {
        const formValue = this.eventForm.value;

        // Prepara i dati per il salvataggio
        const eventData: EventData = {
          title: formValue.title.trim(),
          description: formValue.description?.trim() || '',
          startDate: formValue.startDate,
          endDate: formValue.endDate,
          allDay: formValue.allDay,
          classId: formValue.classId,
          classInfo: formValue.classInfo
        };

        // Chiudi il modale restituendo i dati
        await this.modalCtrl.dismiss({
          event: eventData,
          saved: true
        });
      } catch (error) {
        console.error('Errore durante il salvataggio dell\'evento:', error);
      }
    } else {
      // Mostra errori di validazione
      this.markFormGroupTouched(this.eventForm);
    }
  }

  onCancel() {
    this.modalCtrl.dismiss({
      saved: false
    });
  }

  // Marca tutti i campi come toccati per mostrare gli errori di validazione
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * Apre il selettore di data/ora
   * @param type Il tipo di datetime da modificare ('start' o 'end')
   */
  openDatetime(type: DatetimeType) {
    this.currentDatetime = {
      type,
      value: this.eventForm.get(`${type}Date`)?.value || new Date().toISOString()
    };
  }

  /**
   * Conferma la selezione della data/ora
   */
  confirmDatetime() {
    if (!this.currentDatetime) return;
    
    const { type, value } = this.currentDatetime;
    this.eventForm.get(`${type}Date`)?.setValue(value);
    this.currentDatetime = null;
  }

  /**
   * Annulla la selezione della data/ora
   */
  cancelDatetime() {
    this.currentDatetime = null;
  }
}
