import {
  Component,
  OnInit,
  signal,
  input,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  effect,
  untracked
} from '@angular/core';

type TabType = 'generalita' | 'attivita' | 'pdp' | 'studenti' | 'note' | 'eventi' | 'gruppi' | 'agenda' | 'annotazioni';
import {
  ModalController,
  AlertController,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonTextarea,
  IonButton,
  IonMenu,
  IonMenuButton,
  IonList,
  IonItem,
  IonLabel,
  IonBackButton,
  IonIcon,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonItemDivider
} from '@ionic/angular/standalone';
import {
  CommonModule
} from '@angular/common';
import {
  FormsModule,
} from '@angular/forms';
import {
  ClassiService,
} from '../services/classi.service';
import { ClasseModel } from '../models/classModel';
import { DocumentModel } from '../models/documentModel';
import { ActivatedRoute } from '@angular/router';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { ListStudent4classComponent } from '../components/list-student4class/list-student4class.component';
import { Evaluation } from 'src/app/pages/evaluations/models/evaluation';
import { ReservedNotes4ClassesComponent } from '../components/reserved-notes4classes/reserved-notes4classes.component';
import { ListActivities4classComponent } from "../components/listActivities4class/list-activities4class/list-activities4class.component"
import { UsersService } from 'src/app/shared/services/users.service';
import { GroupsManagerComponent } from '../components/groups-manager/groups-manager.component';
import { StudentsWithPdPComponent } from '../components/students-with-pd-p/students-with-pd-p.component';
import { DisplayAgenda4ClassesComponent } from 'src/app/pages/agenda/components/display-agenda4-classes/display-agenda4-classes.component';
import { EventDialogComponent } from '../../agenda/components/event-dialog/event-dialog.component';
import { AgendaEvent } from '../../agenda/models/agendaEvent';
import { addIcons } from 'ionicons';
import {
  menu,
  informationCircle,
  people,
  chatbox,
  list,
  peopleCircle,
  school,
  calendar,
  close,
  add,
  trash,
  alertCircle
} from 'ionicons/icons';
/**
 * Pagina di dettaglio e modifica di una classe.
 * Gestisce diverse schede (generalità, attività, PDP, studenti, note, ecc.).
 */
@Component({
  selector: 'app-classe-dialog',
  templateUrl: './classe-dialog.html',
  styleUrls: ['./classe-dialog.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    IonButton,
    IonInput,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonTextarea,
    IonBackButton,
    IonMenu,
    IonMenuButton,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    CommonModule,
    ListStudent4classComponent,
    ReservedNotes4ClassesComponent,
    ListActivities4classComponent,
    GroupsManagerComponent,
    StudentsWithPdPComponent,
    DisplayAgenda4ClassesComponent,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonItemDivider
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ClasseDialogPage implements OnInit {
  // Gestione tab attivo
  selectedTab = signal<TabType>('generalita');

  // Gestione sidebar
  sidebarOpen = signal<boolean>(false);

  // Metodo per cambiare scheda e chiudere il menu
  /**
   * Seleziona un tab e chiude la sidebar laterale.
   * @param tab Il tab da selezionare.
   */
  selectTab(tab: TabType) {
    this.selectedTab.set(tab);
    this.sidebarOpen.set(false);  // Chiude il menu
  }

  // Metodo per aprire/chiudere la sidebar
  toggleSidebar() {
    console.log('toggleSidebar called! Current state:', this.sidebarOpen());
    this.sidebarOpen.update(value => !value);
    console.log('Sidebar toggled, new sidebarOpen value:', this.sidebarOpen());
  }

  classkey = signal<string>('');
  classe = signal<ClasseModel>(new ClasseModel({}));
  teacherkey = signal<string>('');
  verbaliList = signal<DocumentModel[]>([]);

  // Pure Signals for Form Fields
  classeName = signal('');
  year = signal('');
  coordinatore = signal('');
  segretario = signal('');
  descrizione = signal('');
  note = signal('');

  // Touched state signals for validation UX
  classeNameTouched = signal(false);
  yearTouched = signal(false);
  coordinatoreTouched = signal(false);
  segretarioTouched = signal(false);
  descrizioneTouched = signal(false);
  noteTouched = signal(false);

  // Initial values for dirty checking
  private initialValues = {
    classeName: '',
    year: '',
    coordinatore: '',
    segretario: '',
    descrizione: '',
    note: ''
  };

  isEditMode: boolean = false;
  initialVerbali: string = '[]';

  // Computed Validation
  // Computed Validation
  classeNameError = computed(() => null);
  yearError = computed(() => null);
  coordinatoreError = computed(() => null);
  segretarioError = computed(() => null);
  // descrizioneError = computed(() => !this.descrizione() ? 'Il campo "Descrizione" è obbligatorio.' : null); // Removed as per request
  descrizioneError = computed(() => null);
  noteError = computed(() => null);

  isValid = computed(() => true);

  isDirty = computed(() => {
    return this.classeName() !== this.initialValues.classeName ||
      this.year() !== this.initialValues.year ||
      this.coordinatore() !== this.initialValues.coordinatore ||
      this.segretario() !== this.initialValues.segretario ||
      this.descrizione() !== this.initialValues.descrizione ||
      this.note() !== this.initialValues.note;
  });

  constructor(
    private modalCtrl: ModalController,
    private service: ClassiService,
    private route: ActivatedRoute,
    private toaster: ToasterService,
    private $users: UsersService,
    private alertCtrl: AlertController
  ) {
    // Register icons
    addIcons({ menu, close, informationCircle, people, chatbox, list, add, peopleCircle, calendar, school, trash, alertCircle });

    // Initialize with empty model
    this.classe.set(new ClasseModel({
      year: '',
      classe: '',
      descrizione: '',
      note: '',
      verbali: []
    }));

    effect(() => {
      const key = this.classkey();
      if (key) {
        // We can run this without untracked as we don't read signals inside the async block that we write to
        (async () => {
          this.isEditMode = true;
          try {
            const editingClasse = await this.service.fetchClasse(key);

            // Set signal values individually
            this.classeName.set(editingClasse.classe || '');
            this.year.set(editingClasse.year || '');
            this.coordinatore.set(editingClasse.coordinatore || '');
            this.segretario.set(editingClasse.segretario || '');
            this.descrizione.set(editingClasse.descrizione || '');
            this.note.set(editingClasse.note || '');

            // Store initial values for dirty check
            this.initialValues = {
              classeName: editingClasse.classe || '',
              year: editingClasse.year || '',
              coordinatore: editingClasse.coordinatore || '',
              segretario: editingClasse.segretario || '',
              descrizione: editingClasse.descrizione || '',
              note: editingClasse.note || ''
            };

            this.verbaliList.set(editingClasse.verbali || []);
            this.initialVerbali = JSON.stringify(this.verbaliList());

            // Set signal LAST to trigger change detection
            this.classe.set(editingClasse);

          } catch (error) {
            console.error('Error fetching class:', error);
            this.toaster.presentToast({ message: "Errore durante il caricamento della classe", duration: 2000, position: "bottom" });
          }
        })();
      }
    });

  }

  /**
   * Inizializza il componente recuperando i dettagli della classe se presente.
   */
  async ngOnInit(): Promise<void> {
    const user = await this.$users.getLoggedUser();
    if (user && typeof user === 'object' && 'key' in user) {
      this.teacherkey.set(user.key);
    }
    const classkey = this.route.snapshot.paramMap.get('classkey');
    if (classkey) {
      this.classkey.set(classkey);
    }
  }

  addVerbale() {
    this.verbaliList.update(list => [...list, new DocumentModel()]);
  }

  removeVerbale(index: number) {
    this.verbaliList.update(list => list.filter((_, i) => i !== index));
  }

  /**
   * Salva le modifiche alla classe.
   */
  async save() {
    if (!this.isValid()) {
      this.toaster.presentToast({ message: "Compila tutti i campi obbligatori", duration: 2000, position: "bottom" });
      this.markAllAsTouched();
      return;
    }

    const formValues = {
      year: this.year(),
      classe: this.classeName(),
      descrizione: this.descrizione(),
      note: this.note(),
      coordinatore: this.coordinatore(),
      segretario: this.segretario(),
      verbali: this.verbaliList()
    };

    // Create a new instance with the form values
    const classeObj = new ClasseModel(formValues);

    // Set the key if it exists
    if (this.classkey()) {
      classeObj.setKey(this.classkey()!);
    }

    console.log("saving classeObj", classeObj);

    try {
      if (this.classkey()) {
        await this.service.updateClasse(this.classkey()!, classeObj);
      } else {
        await this.service.addClasse(classeObj);
      }

      // Update initial values to current values (reset dirty state)
      this.initialValues = {
        classeName: this.classeName(),
        year: this.year(),
        coordinatore: this.coordinatore(),
        segretario: this.segretario(),
        descrizione: this.descrizione(),
        note: this.note()
      };

      this.initialVerbali = JSON.stringify(this.verbaliList());

      const toastMessage = this.classkey()
        ? "Classe aggiornata con successo"
        : "Classe aggiunta con successo";

      this.toaster.presentToast({
        message: toastMessage,
        duration: 2000,
        position: "bottom"
      });

    } catch (error) {
      this.toaster.presentToast({ message: "Errore durante l'aggiornamento della classe", duration: 2000, position: "bottom" });
    }
  }

  markAllAsTouched() {
    this.classeNameTouched.set(true);
    this.yearTouched.set(true);
    this.coordinatoreTouched.set(true);
    this.segretarioTouched.set(true);
    this.descrizioneTouched.set(true);
    this.noteTouched.set(true);
  }

  hasUnsavedChanges(): boolean {
    const verbaliChanged = JSON.stringify(this.verbaliList()) !== this.initialVerbali;
    return this.isDirty() || verbaliChanged;
  }

  async dismiss() {
    if (this.hasUnsavedChanges()) {
      const alert = await this.alertCtrl.create({
        header: 'Modifiche non salvate',
        message: 'Hai delle modifiche non salvate. Sei sicuro di voler uscire? Le modifiche andranno perse.',
        buttons: [
          {
            text: 'Annulla',
            role: 'cancel'
          },
          {
            text: 'Esci senza salvare',
            role: 'destructive',
            handler: () => {
              this.modalCtrl.dismiss();
            }
          }
        ]
      });
      await alert.present();
    } else {
      this.modalCtrl.dismiss();
    }
  }

  async openAddActivityDialog() {
    // Implementazione del metodo per aprire il dialog di aggiunta attività
    // Questo è un placeholder - implementa la logica effettiva qui
    console.log('Apertura dialog aggiunta attività');
  }

  async addNewEvent() {
    try {
      const modal = await this.modalCtrl.create({
        component: EventDialogComponent,
        componentProps: {
          classId: this.classe()?.key,
          teacherKey: 'teacher123', // TODO: Sostituisci con la chiave effettiva dell'insegnante
          targetedClasses: this.classe()?.key ? [this.classe()?.key] : []
        },
        breakpoints: [0, 0.8, 1],
        initialBreakpoint: 0.8,
        handle: true,
        handleBehavior: 'cycle'
      });

      await modal.present();

      const { data } = await modal.onDidDismiss();

      if (data?.saved && data.event) {
        const event = new AgendaEvent(data.event);
        console.log('Evento salvato con successo:', event);

        // Qui puoi salvare l'evento nel database o fare altre operazioni necessarie
        // Esempio: await this.eventService.saveEvent(event);

        // Mostra un messaggio di conferma all'utente
        this.toaster.presentToast({
          message: 'Evento salvato con successo',
          duration: 2000,
          position: 'bottom'
        });
      }
    } catch (error) {
      console.error('Errore nell\'apertura del form evento:', error);
      this.toaster.presentToast({ message: 'Errore durante l\'apertura del form evento', duration: 2000, position: "bottom" });
    }
  }
}
