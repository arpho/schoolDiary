import { 
  Component, 
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
  WritableSignal,
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
  IonText,
  IonNote,
  IonToggle,
  ModalController
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { close, save } from 'ionicons/icons';
import { defineCustomElements } from '@ionic/core/loader';
import { ClasseModel } from '../../../classes/models/classModel';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

type CustomDatetimeEvent = CustomEvent<{ value?: string | string[] | null }>;

type DatetimeType = 'start' | 'end';

interface DatetimeValue {
  type: DatetimeType;
  value: string;
}

// Tipi di evento disponibili
type EventType = 'homework' | 'test' | 'interrogation' | 'meeting' | 'note' | 'other';

// Interfaccia per i dati dell'evento
interface EventData {
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
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonDatetime,
    IonDatetimeButton,
    IonModal,
    IonButtons,
    IonButton,
    IonIcon,
    IonSelect,
    IonSelectOption,
    IonCheckbox,
    IonPopover,
    IonText,
    IonNote,
    IonToggle
  ]
})
export class EventFormComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('startDatetime') startDatetime: IonDatetime | undefined;
  @ViewChild('endDatetime') endDatetime: IonDatetime | undefined;

  eventForm!: FormGroup;
  isEditMode = false;
  minDate: string = '';
  maxDate: string = '';
  currentDatetime: { type: 'start' | 'end'; value: string | null } | null = null;
  readonly MAX_TITLE_LENGTH = 100;
  readonly MAX_DESCRIPTION_LENGTH = 500;

  // Input signals
  protected targetedClasses = input.required<ClasseModel[]>({
    alias: 'targetedClasses'
  });

  protected eventData = input<EventData | null>(null, {
    alias: 'eventData'
  });

  private effectRef: any = null;
  private formBuilder = inject(FormBuilder);
  private cdRef = inject(ChangeDetectorRef);
  private modalCtrl = inject(ModalController);
  private el = inject(ElementRef);

  // Lista delle classi disponibili
  protected listaclassi: ClasseModel[] = [];

  // Tipi di evento disponibili per il selettore
  eventTypes: {value: EventType, label: string}[] = [
    { value: 'homework', label: 'Compiti' },
    { value: 'test', label: 'Verifica' },
    { value: 'interrogation', label: 'Interrogazione' },
    { value: 'meeting', label: 'Riunione' },
    { value: 'note', label: 'Nota' },
    { value: 'other', label: 'Altro' }
  ];

  constructor() {
    // Add icons
    addIcons({ close, save });
    defineCustomElements(window);

    // Imposta le date minime e massime (es. da oggi a 1 anno da oggi)
    const today = new Date();
    this.minDate = today.toISOString();

    const nextYear = new Date();
    nextYear.setFullYear(today.getFullYear() + 1);
    this.maxDate = nextYear.toISOString();
  }

  ngOnInit(): void {
    const eventData = this.eventData();
    console.log("eventData",eventData);
    if (eventData) {
      this.isEditMode = true;
      
      // Se il form è già stato inizializzato, esegui subito il patch
      if (this.eventForm) {
        this.patchFormWithEventData(eventData);
      } else {
        // Altrimenti aspetta che l'effect nel costruttore completi l'inizializzazione
        this.effectRef = effect(() => {
          if (this.eventForm) {
            this.patchFormWithEventData(eventData);
            if (this.effectRef) {
              this.effectRef.destroy();
              this.effectRef = null;
            }
          }
        });
      }
    }
  }

  ngAfterViewInit(): void {
    this.addPassiveEventListeners();
  }

  ngOnDestroy(): void {
    if (this.effectRef) {
      this.effectRef.destroy();
    }
  }

  private patchFormWithEventData(eventData: EventData): void {
    if (!this.eventForm) return;
    
    this.eventForm.patchValue({
      title: eventData.title,
      description: eventData.description,
      startDate: this.formatDateForInput(eventData.startDate),
      endDate: this.formatDateForInput(eventData.endDate),
      allDay: eventData.allDay,
      type: eventData.type,
      selectedClass: eventData.targetedClasses?.[0]?.key || null
    });
  }

  private initializeForm(): void {
    const now = new Date();
    const endDate = new Date(now.getTime() + 60 * 60 * 1000); // +1 ora
    const initialClasses = this.targetedClasses();

    this.eventForm = this.formBuilder.group({
      title: [
        '',
        [
          Validators.required,
          Validators.maxLength(this.MAX_TITLE_LENGTH)
        ]
      ],
      description: [
        '',
        [
          Validators.maxLength(this.MAX_DESCRIPTION_LENGTH)
        ]
      ],
      startDate: [
        now.toISOString(),
        [Validators.required]
      ],
      endDate: [
        endDate.toISOString(),
        [Validators.required]
      ],
      allDay: [false],
      selectedClass: [
        initialClasses.length > 0 ? initialClasses[0].key : null,
        [Validators.required]
      ],
      type: ['other', Validators.required]
    });
  }

  private formatDateForInput(dateString: string | Date): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString();
  }

  private addPassiveEventListeners(): void {
    // Aggiungi qui eventuali listener passivi per migliorare le prestazioni
    const elements = this.el.nativeElement.querySelectorAll(
      'ion-datetime, ion-select, ion-popover'
    );
    elements.forEach((el: HTMLElement) => {
      el.addEventListener('touchstart', null as any, { passive: true });
    });
  }

  // Gestisce l'annullamento della selezione data/ora
  cancelDatetime(): void {
    this.currentDatetime = null;
  }

  // Gestisce l'invio del form
  async onSubmit(): Promise<void> {
    if (this.eventForm.valid) {
      try {
        const formValue = this.eventForm.value;
        const selectedClass = this.targetedClasses.find(
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
    }
  }

  // Gestisce l'annullamento della modifica
  async onCancel(): Promise<void> {
    await this.modalCtrl.dismiss(null, 'cancel');
  }

  // Gestisce il cambio della data/ora di inizio
  onStartDateChange(event: CustomDatetimeEvent): void {
    if (event.detail?.value) {
      const startDate = new Date(event.detail.value as string);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // +1 ora
      
      this.eventForm?.patchValue({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
    }
  }

  // Gestisce il cambio della data/ora di fine
  onEndDateChange(event: any): void {
    if (event.detail?.value) {
      this.eventForm?.patchValue({
        endDate: new Date(event.detail.value).toISOString()
      });
    }
  }

  // Gestisce il cambio della modalità tutto il giorno
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

  // Restituisce l'array delle classi selezionate
  get targetedClassesArray(): ClasseModel[] {
    const selectedClassKey = this.eventForm?.get('selectedClass')?.value;
    if (!selectedClassKey) return [];
    
    const classes = this.targetedClasses();
    const selectedClass = Array.isArray(classes) ? classes.find(c => c.key === selectedClassKey) : undefined;
    return selectedClass ? [selectedClass] : [];
  }

  // Helper per verificare se una classe è selezionata
  isClassSelected(classKey: string): boolean {
    return this.eventForm?.get('selectedClass')?.value === classKey;
  }

  // Gestisce la selezione/deselezione di una classe
  toggleClassSelection(classKey: string): void {
    const currentValue = this.eventForm?.get('selectedClass')?.value;
    this.eventForm?.patchValue({
      selectedClass: currentValue === classKey ? null : classKey
    });
  }

  // Marca tutti i campi come toccati per mostrare gli errori di validazione
  private markFormGroupTouched(formGroup: FormGroup): void {
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
