import { 
  Component, 
  Input, 
  OnInit, 
  OnDestroy, 
  AfterViewInit, 
  ChangeDetectorRef, 
  ElementRef, 
  ViewChild, 
  input, 
  effect, 
  inject, 
  signal, 
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';

import { 
  IonButton, 
  IonButtons, 
  IonContent, 
  IonDatetime, 
  IonDatetimeButton, 
  IonHeader, 
  IonIcon, 
  IonInput, 
  IonItem, 
  IonLabel, 
  IonList, 
  IonModal, 
  IonTextarea, 
  IonSelect, 
  IonSelectOption, 
  IonTitle, 
  IonToolbar, 
  IonCheckbox, 
  IonPopover, 
  ModalController,
  NavParams,
  ModalOptions
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { close, save } from 'ionicons/icons';
import { defineCustomElements } from '@ionic/core/loader';
import { ClasseModel } from '../../../classes/models/classModel';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { from } from 'rxjs';

type CustomDatetimeEvent = CustomEvent<{ value?: string | string[] | null }>;

type DatetimeType = 'start' | 'end';

interface DatetimeValue {
  type: DatetimeType;
  value: string;
}

// Tipi di evento disponibili
export type EventType = 'homework' | 'test' | 'interrogation' | 'note' | 'meeting' | 'other';

// Interfaccia per i dati dell'evento
export interface EventData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  targetedClasses: ClasseModel[];
  type: EventType;
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
    IonButton,
    IonButtons,
    IonContent,
    IonDatetime,
    IonDatetimeButton,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonModal,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonTitle,
    IonToolbar,
    IonCheckbox,
    IonPopover,
  ]
})
export class EventFormComponent implements OnInit, AfterViewInit, OnDestroy {
cancelDatetime() {
console.log("cancelDatetime");
}

  // Riferimenti ai componenti
  @ViewChild('startDatetime') startDatetime: IonDatetime | undefined;
  @ViewChild('endDatetime') endDatetime: IonDatetime | undefined;

  // Proprietà del form
  eventForm!: FormGroup;
  isEditMode = false;

  // Proprietà per la gestione delle date
  minDate: string = '';
  maxDate: string = '';
  currentDatetime: { type: 'start' | 'end'; value: string | null } | null = null;

  // Costanti di validazione
  readonly MAX_TITLE_LENGTH = 100;
  readonly MAX_DESCRIPTION_LENGTH = 500;
  
  // Input properties
  protected targetedClasses = input.required<ClasseModel[]>({
    alias: 'targetedClasses'
  });

  protected eventData = input<EventData | null>(null, {
    alias: 'eventData'
  });

  // Opzioni per il tipo di evento


  // Metodi richiesti dal template













  // Metodi del ciclo di vita
  ngOnInit(): void {
    // Se stai modificando un evento esistente, popola il form
    const eventData = this.eventData();
    if (eventData) {
      this.isEditMode = true;
      this.eventForm.patchValue({
        ...eventData,
        startDate: this.formatDateForInput(eventData.startDate),
        endDate: this.formatDateForInput(eventData.endDate)
      });
    }
  }





  // Tipi di evento disponibili
  eventTypes: {value: EventType, label: string}[] = [
    { value: 'homework', label: 'Compiti' },
    { value: 'test', label: 'Verifica' },
    { value: 'interrogation', label: 'Interrogazione' },
    { value: 'meeting', label: 'Riunione' },
    { value: 'note', label: 'Nota' },
    { value: 'other', label: 'Altro' }
  ];

  private formBuilder = inject(FormBuilder);
  private cdRef = inject(ChangeDetectorRef);
  private modalCtrl = inject(ModalController);
  private el = inject(ElementRef);


  constructor(

  ) {
    // Add icons
    addIcons({ close, save });
    defineCustomElements(window);

    // Imposta le date minime e massime (es. da oggi a 1 anno da oggi)
    const today = new Date();
    this.minDate = today.toISOString();

    const nextYear = new Date();
    nextYear.setFullYear(today.getFullYear() + 1);
    this.maxDate = nextYear.toISOString();

    // Inizializza il form
    this.initializeForm();

    // Effetto per la selezione automatica della classe se ce n'è solo una
    effect(() => {
      const classes = this.targetedClasses();
      if (classes.length === 1) {
        this.eventForm.get('selectedClass')?.setValue(classes[0].key);
      }
    });
  }

  ngAfterViewInit(): void {
    // Forza l'aggiornamento della vista dopo che è stata inizializzata
    this.cdRef.detectChanges();
    
    // Aggiungi i listener passivi per migliorare le prestazioni dello scorrimento
    this.addPassiveEventListeners();
  }

  ngOnDestroy(): void {
    // Pulizia delle risorse se necessario
  }

  private addPassiveEventListeners(): void {
    if (typeof window === 'undefined') {
      return;
    }
    
    const elements = this.el.nativeElement.querySelectorAll('ion-datetime, ion-select, ion-popover');
    elements.forEach((element: HTMLElement) => {
      element.addEventListener('touchstart', () => {}, { passive: true });
      element.addEventListener('touchmove', () => {}, { passive: true });
    });
  }

  private initializeForm() {
    const now = new Date();
    const endDate = new Date(now);
    endDate.setHours(now.getHours() + 1); // Imposta la fine a 1 ora dopo l'inizio

    // Ottieni i parametri dagli input
    const eventData = this.eventData() || {} as EventData;
    const initialClasses = this.targetedClasses() || [];

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
      selectedClass: [
        initialClasses.length > 0 ? initialClasses[0].key : null,
        [Validators.required]
      ],
      type: [eventData?.type || 'other', Validators.required]
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

  get targetedClassesArray(): FormArray {
    return this.eventForm.get('targetedClasses') as FormArray;
  }

  // Helper per verificare se una classe è selezionata
  isClassSelected(classKey: string): boolean {
    return this.targetedClassesArray.value.includes(classKey);
  }

  // Gestisce la selezione/deselezione di una classe
  toggleClassSelection(classKey: string) {
    const classesArray = this.targetedClassesArray;
    const index = classesArray.value.indexOf(classKey);
    
    if (index > -1) {
      // Rimuovi se già presente
      classesArray.removeAt(index);
    } else {
      // Aggiungi se non presente
      classesArray.push(new FormControl(classKey));
    }
  }

  async onSubmit() {
    if (this.eventForm.valid) {
      try {
        const formValue = this.eventForm.value;
        const selectedClass = this.targetedClasses().find(
          (c: ClasseModel) => c.key === formValue.selectedClass
        );

        if (!selectedClass) {
          console.error('Nessuna classe selezionata');
          return;
        }

        // Prepara i dati per il salvataggio
        const eventData: EventData = {
          title: formValue.title.trim(),
          description: formValue.description?.trim() || '',
          startDate: formValue.startDate,
          endDate: formValue.endDate,
          allDay: formValue.allDay,
          targetedClasses: [selectedClass],
          type: formValue.type
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

}
