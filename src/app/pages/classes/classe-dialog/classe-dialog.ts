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

import { form, schema, FormField, FormRoot } from '@angular/forms/signals';
import { FormsModule } from '@angular/forms';
import { ClassiService } from '../services/classi.service';
import { ClasseModel } from '../models/classModel';
import { DocumentModel } from '../models/documentModel';
import { ActivatedRoute, Router } from '@angular/router';
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
  alertCircle,
  link,
  copyOutline,
  openOutline,
  grid
} from 'ionicons/icons';
import { HasUnsavedChanges } from 'src/app/shared/guards/pending-changes.guard';

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
    IonItemDivider,
    FormField,
    FormRoot
],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ClasseDialogPage implements OnInit, HasUnsavedChanges {
  // Gestione tab attivo
  selectedTab = signal<TabType>('generalita');

  // Gestione sidebar
  sidebarOpen = signal<boolean>(false);

  // Metodo per cambiare scheda e chiudere il menu
  selectTab(tab: TabType) {
    this.selectedTab.set(tab);
    this.sidebarOpen.set(false);
  }

  // Metodo per aprire/chiudere la sidebar
  toggleSidebar() {
    this.sidebarOpen.update(value => !value);
  }

  classkey = signal<string>('');
  classe = signal<ClasseModel>(new ClasseModel({}));
  teacherkey = signal<string>('');
  verbaliList = signal<DocumentModel[]>([]);

  classeModel = signal({
    classeName: '',
    year: '',
    coordinatore: '',
    segretario: '',
    descrizione: '',
    note: ''
  });

  classeForm = form(this.classeModel, schema((s) => {}));

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

  isValid = computed(() => this.classeForm().valid());

  isDirty = computed(() => {
    const vals = this.classeForm().value();
    return vals.classeName !== this.initialValues.classeName ||
      vals.year !== this.initialValues.year ||
      vals.coordinatore !== this.initialValues.coordinatore ||
      vals.segretario !== this.initialValues.segretario ||
      vals.descrizione !== this.initialValues.descrizione ||
      vals.note !== this.initialValues.note;
  });

  constructor(
    private modalCtrl: ModalController,
    private service: ClassiService,
    private route: ActivatedRoute,
    private router: Router,
    private toaster: ToasterService,
    private $users: UsersService,
    private alertCtrl: AlertController
  ) {
    addIcons({ menu, close, informationCircle, people, chatbox, list, add, peopleCircle, calendar, school, trash, alertCircle, link, copyOutline, openOutline, grid });

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
        (async () => {
          this.isEditMode = true;
          try {
            const editingClasse = await this.service.fetchClasse(key);

            this.classeForm().value.update(v => ({...v, ...({
              classeName: editingClasse.classe || '',
              year: editingClasse.year || '',
              coordinatore: editingClasse.coordinatore || '',
              segretario: editingClasse.segretario || '',
              descrizione: editingClasse.descrizione || '',
              note: editingClasse.note || ''
            })}));

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

            this.classe.set(editingClasse);

          } catch (error) {
            console.error('Error fetching class:', error);
            this.toaster.presentToast({ message: "Errore durante il caricamento della classe", duration: 2000, position: "bottom" });
          }
        })();
      }
    });

  }

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

  openLink(url: string): void {
    if (url) {
      window.open(url, '_blank');
    }
  }

  copyLink(url: string): void {
    if (url) {
      navigator.clipboard.writeText(url).then(() => {
        this.toaster.presentToast({ message: 'Link copiato negli appunti', duration: 1500, position: 'bottom' });
      }).catch(() => {
        this.toaster.presentToast({ message: 'Impossibile copiare il link', duration: 1500, position: 'bottom' });
      });
    }
  }

  async save() {
    if (!this.isValid()) {
      this.toaster.presentToast({ message: "Compila tutti i campi obbligatori", duration: 2000, position: "bottom" });
      return;
    }

    const formValues = this.classeForm().value();
    const classeObjData = {
      year: formValues.year,
      classe: formValues.classeName,
      descrizione: formValues.descrizione,
      note: formValues.note,
      coordinatore: formValues.coordinatore,
      segretario: formValues.segretario,
      verbali: this.verbaliList()
    };

    const classeObj = new ClasseModel(classeObjData);

    if (this.classkey()) {
      classeObj.setKey(this.classkey()!);
    }

    try {
      if (this.classkey()) {
        await this.service.updateClasse(this.classkey()!, classeObj);
      } else {
        await this.service.addClasse(classeObj);
      }

      this.initialValues = {
        classeName: formValues.classeName,
        year: formValues.year,
        coordinatore: formValues.coordinatore,
        segretario: formValues.segretario,
        descrizione: formValues.descrizione,
        note: formValues.note
      };

      this.initialVerbali = JSON.stringify(this.verbaliList());

      const toastMessage = this.classkey()
        ? "Classe aggiornata con successo"
        : "Classe aggiunta con successo";

      this.toaster.presentToast({ message: toastMessage, duration: 2000, position: "bottom" });

    } catch (error) {
      console.error('Error saving class:', error);
      this.toaster.presentToast({ message: "Errore durante l'aggiornamento della classe", duration: 2000, position: "bottom" });
    }
  }

  hasUnsavedChanges(): boolean {
    const verbaliChanged = JSON.stringify(this.verbaliList()) !== this.initialVerbali;
    return this.isDirty() || verbaliChanged;
  }

  async dismiss() {
    this.modalCtrl.dismiss();
  }

  async openAddActivityDialog() {
    console.log('Apertura dialog aggiunta attività');
  }

  async addNewEvent() {
    try {
      const modal = await this.modalCtrl.create({
        component: EventDialogComponent,
        componentProps: {
          classId: this.classe()?.key,
          teacherKey: 'teacher123',
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
        this.toaster.presentToast({ message: 'Evento salvato con successo', duration: 2000, position: 'bottom' });
      }
    } catch (error) {
      console.error('Errore nell\'apertura del form evento:', error);
      this.toaster.presentToast({ message: 'Errore durante l\'apertura del form evento', duration: 2000, position: "bottom" });
    }
  }

  goToTabellone() {
    if (this.classe()?.key && this.teacherkey()) {
      this.router.navigate(['/class-evaluations-overview', this.classe().key, this.teacherkey()]);
    }
  }
}
