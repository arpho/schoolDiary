import { Component, OnInit, inject, signal, ChangeDetectionStrategy, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonToggle,
  IonFab,
  IonFabButton,
  IonIcon,
  IonLabel,
  ModalController
} from '@ionic/angular/standalone';
import { UsersService } from '../../shared/services/users.service';
import { AgendaListComponent } from './components/agenda-list/agenda-list.component';
import { AgendaSchedulerToastUiComponent } from './components/agenda-scheduler-toast-ui/agenda-scheduler-toast-ui.component';
import { AgendaService } from 'src/app/shared/services/agenda.service';
import { ClassiService } from 'src/app/pages/classes/services/classi.service';
import { AgendaEvent } from './models/agendaEvent';
import { ClasseModel } from '../classes/models/classModel';
import { QueryCondition } from 'src/app/shared/models/queryCondition';
import { addIcons } from 'ionicons';
import { add, calendar, list } from 'ionicons/icons';
import { EventDialogComponent } from './components/event-dialog/event-dialog.component';
import { AgendaEventInputComponent } from '../../shared/components/agenda-event-input/agenda-event-input.component';

/**
 * Componente principale per la gestione dell'agenda scolastica.
 * Permette di visualizzare gli eventi in modalità lista o calendario (scheduler),
 * filtrare per le classi del docente loggato e gestire l'aggiunta o modifica di eventi.
 */
@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.page.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonButtons,
    IonBackButton,
    IonToggle,
    IonFab,
    IonFabButton,
    IonIcon,
    IonLabel,
    AgendaListComponent,
    AgendaSchedulerToastUiComponent
  ]
})
export class AgendaPage implements OnInit {
  private usersService = inject(UsersService);
  private agendaService = inject(AgendaService);
  private classiService = inject(ClassiService);
  private modalCtrl = inject(ModalController);

  // Signals per lo stato del componente
  teacherKey = signal<string>(''); // Chiave del docente loggato
  targetedClasses = signal<string[]>([]); // Chiavi delle classi associate al docente
  listaClassi = signal<ClasseModel[]>([]); // Dettagli completi delle classi
  private fetchedEvents = signal<AgendaEvent[]>([]);

  viewMode = signal<'list' | 'scheduler'>('list'); // Modalità di visualizzazione corrente
  viewModeLabel = computed(() => this.viewMode() === 'list' ? 'Lista' : 'Calendario'); // Label per lo switch
  showPastEvents = signal<boolean>(false); // Mostra anche gli eventi passati
  pageTitle = signal<string>('agenda'); // Titolo dinamico della pagina

  agenda = computed(() => {
    const events = [...this.fetchedEvents()];
    const mode = this.viewMode();
    const now = Date.now();

    return events.sort((a, b) => {
      if (mode === 'list') {
        const distA = Math.abs(now - new Date(a.dataInizio).getTime());
        const distB = Math.abs(now - new Date(b.dataInizio).getTime());
        return distA - distB;
      } else {
        return new Date(a.dataInizio).getTime() - new Date(b.dataInizio).getTime();
      }
    });
  });

  /**
   * Costruttore: Inizializza icone e configura l'effect per il caricamento reattivo dei dati.
   * Al variare delle targetedClasses, recupera i dettagli delle classi e sottoscrive agli eventi agenda in real-time.
   */
  constructor() {
    addIcons({ add, calendar, list });
    this.initialize();

    // Effect for Classes and Title
    effect(async () => {
      const targetedClasses = this.targetedClasses();
      if (targetedClasses.length > 0) {
        // Fetch classes details
        const classPromises = targetedClasses.map(classKey =>
          this.classiService.fetchClasseOnCache(classKey)
        );
        const classes = await Promise.all(classPromises);
        this.listaClassi.set(classes);

        // Update Title
        const title = classes.length > 1
          ? `agenda per le classi: ${classes.map(c => c?.classe).join(', ')}`
          : `agenda per ${classes[0]?.classe}`;
        this.pageTitle.set(title);
      }
    });

    // Effect for Agenda Events
    effect((onCleanup) => {
      const targetedClasses = this.targetedClasses();
      const showPast = this.showPastEvents();

      if (targetedClasses.length > 0) {
        const queries = [new QueryCondition('classKey', 'in', targetedClasses)];

        if (!showPast) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          queries.push(new QueryCondition('dataFine', '>=', today.toISOString()));
        }

        const unsubscribe = this.agendaService.getAgenda4targetedClassesOnrealtime((events: AgendaEvent[]) => {
          this.fetchedEvents.set(events);
        }, queries);

        onCleanup(() => {
          if (unsubscribe) unsubscribe();
        });
      }
    });
  }

  /**
   * Inizializzazione dati utente.
   * Recupera l'utente loggato e imposta le chiavi del docente e delle sue classi.
   */
  async initialize() {
    const user = await this.usersService.getLoggedUser();
    if (user) {
      this.teacherKey.set(user.key);
      this.targetedClasses.set(user.classesKey);
    }
  }

  ngOnInit() { }

  /**
   * Apre il modale per la creazione di un nuovo evento in agenda.
   * Passa la lista delle classi disponibili al componente del form.
   */
  async addNewEvent() {
    const modal = await this.modalCtrl.create({
      component: EventDialogComponent,
      componentProps: {
        targetedClasses: this.listaClassi()
      },
      breakpoints: [0, 0.8, 1],
      initialBreakpoint: 0.8,
      handle: true,
      handleBehavior: 'cycle'
    });

    await modal.present();
  }

  /**
   * Cambia la modalità di visualizzazione tra Lista e Calendario.
   * @param event Evento del toggle di Ionic
   */
  toggleView(event: any) {
    this.viewMode.set(event.detail.checked ? 'scheduler' : 'list');
  }

  togglePastEvents(event: any) {
    this.showPastEvents.set(event.detail.checked);
  }

  /**
   * Gestisce il click su un evento esistente aprendo il modale di modifica/dettaglio.
   * @param event L'evento agenda selezionato
   */
  async onEventClick(event: AgendaEvent) {
    const modal = await this.modalCtrl.create({
      component: AgendaEventInputComponent,
      componentProps: {
        event: event,
        classKey: event.classKey,
        teacherKey: event.teacherKey
      }
    });

    await modal.present();
  }
}
