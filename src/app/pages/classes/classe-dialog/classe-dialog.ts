import {
  Component,
  OnInit,
  signal,
  input,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';

type TabType = 'generalita' | 'attivita' | 'pdp' | 'studenti' | 'note' | 'eventi' | 'gruppi' | 'agenda' | 'annotazioni';
import { ModalController, AlertController, IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonTextarea, IonButton, IonMenu, IonMenuButton, IonList, IonItem, IonLabel, IonBackButton, IonIcon, IonCardContent, IonGrid, IonRow, IonCol, IonItemDivider } from '@ionic/angular/standalone';
import {
  CommonModule
} from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
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
import { menu, informationCircle, people, chatbox, list, peopleCircle, school, calendar, close, add, trash } from 'ionicons/icons';
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
    ReactiveFormsModule,
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
    FormsModule,
    ReactiveFormsModule,
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
  selectedTab: TabType = 'generalita';

  // Gestione sidebar
  sidebarOpen = false;

  // Metodo per cambiare scheda e chiudere il menu
  // Metodo per cambiare scheda e chiudere il menu
  /**
   * Seleziona un tab e chiude la sidebar laterale.
   * @param tab Il tab da selezionare.
   */
  selectTab(tab: TabType) {
    this.selectedTab = tab;
    this.sidebarOpen = false;  // Chiude il menu
    this.cdr.detectChanges();  // Forza l'aggiornamento della vista
    if (tab === 'agenda') {
      this.cdr.detectChanges();
      console.log('Change detection forzato per il tab agenda');
    }
  }

  // Metodo per aprire/chiudere la sidebar
  toggleSidebar() {
    console.log('toggleSidebar called! Current state:', this.sidebarOpen);
    this.sidebarOpen = !this.sidebarOpen;
    console.log('Sidebar toggled, new sidebarOpen value:', this.sidebarOpen);
    console.log('Sidebar element should now have class:', this.sidebarOpen ? 'sidebar-open' : 'closed');

    // Forza il rilevamento delle modifiche
    this.cdr.detectChanges();
  }

  classkey = signal<string>('');
  classe = signal<ClasseModel>(new ClasseModel({}));
  teacherkey = signal<string>('');
  formClass = new FormGroup({
    classe: new FormControl('', Validators.required),
    year: new FormControl('', Validators.required),
    coordinatore: new FormControl('', Validators.required),
    segretario: new FormControl('', Validators.required),
    descrizione: new FormControl('', Validators.required),
    note: new FormControl('', Validators.required),
  });
  isEditMode: boolean = false;

  initialVerbali: string = '[]';

  constructor(
    private modalCtrl: ModalController,
    private service: ClassiService,
    private route: ActivatedRoute,
    private toaster: ToasterService,
    private $users: UsersService,
    private cdr: ChangeDetectorRef,
    private alertCtrl: AlertController
  ) {
    // Register icons
    addIcons({ menu, close, informationCircle, people, chatbox, list, add, peopleCircle, calendar, school, trash });

    // Initialize with empty model
    this.classe.set(new ClasseModel({
      year: '',
      classe: '',
      descrizione: '',
      note: '',
      verbali: []
    }));
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

    if (classkey) {
      if (this.classkey()) {
        this.isEditMode = true;
        const editingClasse = await this.service.fetchClasse(this.classkey()!);
        this.classe.set(editingClasse);
        this.verbaliList.set(editingClasse.verbali || []);
        this.initialVerbali = JSON.stringify(this.verbaliList());
        this.formClass.setValue({
          classe: editingClasse.classe,
          year: editingClasse.year,
          coordinatore: editingClasse.coordinatore,
          segretario: editingClasse.segretario,
          descrizione: editingClasse.descrizione,
          note: editingClasse.note
        });

      }
    }
  }

  verbaliList = signal<DocumentModel[]>([]);

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
    // Get form values with fallback to empty strings for required fields
    const formValues = {
      year: this.formClass.value.year || '',
      classe: this.formClass.value.classe || '',
      descrizione: this.formClass.value.descrizione || '',
      note: this.formClass.value.note || '',
      coordinatore: this.formClass.value.coordinatore || '',
      segretario: this.formClass.value.segretario || '',
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

      this.formClass.markAsPristine();
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

  hasUnsavedChanges(): boolean {
    const verbaliChanged = JSON.stringify(this.verbaliList()) !== this.initialVerbali;
    return this.formClass.dirty || verbaliChanged;
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
