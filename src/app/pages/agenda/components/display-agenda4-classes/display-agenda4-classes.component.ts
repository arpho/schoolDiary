import { Component, ChangeDetectionStrategy, effect, input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonList,
  IonListHeader,
  IonItem,
  IonLabel,
  IonFab,
  IonFabButton,
  IonIcon,
  ModalController,
  IonSegment,
  IonSegmentButton,
  IonToolbar
} from '@ionic/angular/standalone';
import { ClassiService } from 'src/app/pages/classes/services/classi.service';
import { AgendaEvent } from '../../models/agendaEvent';
import { AgendaService } from 'src/app/shared/services/agenda.service';
import { ClasseModel } from 'src/app/pages/classes/models/classModel';
import { AgendaDisplayComponent } from 'src/app/shared/components/agenda-display/agenda-display.component';
import { addIcons } from 'ionicons';
import { add, calendar, list, timeOutline } from 'ionicons/icons';
import { EventDialogComponent } from '../event-dialog/event-dialog.component';
import { QueryCondition } from 'src/app/shared/models/queryCondition';
import { AgendaSchedulerToastUiComponent } from '../agenda-scheduler-toast-ui/agenda-scheduler-toast-ui.component';
import { AgendaEventInputComponent } from 'src/app/shared/components/agenda-event-input/agenda-event-input.component';

/**
 * Componente per visualizzare l'agenda filtrata per specifiche classi.
 * Utilizzato nei dialoghi delle classi per mostrare gli eventi correlati.
 */
@Component({
  selector: 'app-display-agenda4-classes',
  templateUrl: './display-agenda4-classes.component.html',
  styleUrls: ['./display-agenda4-classes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    IonList,
    IonListHeader,
    IonItem,
    IonLabel,
    IonFab,
    IonFabButton,
    IonIcon,
    IonSegment,
    IonSegmentButton,
    IonToolbar,
    AgendaDisplayComponent,
    AgendaSchedulerToastUiComponent
  ]
})
export class DisplayAgenda4ClassesComponent {
  targetedClasses = input.required<string[]>();
  title = signal<string>('');
  private fetchedEvents = signal<AgendaEvent[]>([]);
  listaClassi = signal<ClasseModel[]>([]);

  viewMode = signal<'list' | 'scheduler'>('list');
  showPastEvents = signal<boolean>(false);
  segmentValue = computed<'list' | 'scheduler' | 'past'>(() =>
    this.showPastEvents() ? 'past' : this.viewMode()
  );

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

  // Computed message that adapts to singular/plural
  emptyMessage = computed(() =>
    this.targetedClasses().length > 1
      ? 'Nessun evento in agenda per queste classi'
      : 'Nessun evento in agenda per questa classe'
  );

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

  onSegmentChange(event: any) {
    const value: 'list' | 'scheduler' | 'past' = event.detail.value;
    if (value === 'past') {
      this.viewMode.set('list');
      this.showPastEvents.set(true);
    } else {
      this.viewMode.set(value);
      this.showPastEvents.set(false);
    }
  }

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

  constructor(
    private $classes: ClassiService,
    private $agenda: AgendaService,
    private modalCtrl: ModalController
  ) {
    effect(async () => {
      const classPromises = this.targetedClasses().map((classKey) => {
        if (!this.$classes) {
          throw new Error('ClassiService non inizializzato');
        }
        return this.$classes.fetchClasseOnCache(classKey);
      });
      const classes = await Promise.all(classPromises);
      this.listaClassi.set(classes);
    });
    addIcons({ add, calendar, list, timeOutline });
  }

  // Effect as field initializer - runs in injection context
  private classesEffect = effect((onCleanup) => {
    const targetedClasses = this.targetedClasses();
    const showPast = this.showPastEvents();

    if (targetedClasses.length > 0) {
      const updateTitle = async () => {
        const classPromises = targetedClasses.map((classKey) => this.$classes.fetchClasseOnCache(classKey));
        const classes = await Promise.all(classPromises);
        const title = classes.length > 1 ?
          `agenda per le classi: ${classes.map((classe) => classe?.classe).join(', ')}` : `agenda per ${classes[0]?.classe}`;
        this.title.set(title);
      };
      updateTitle();

      const queries = [new QueryCondition('classKey', 'in', targetedClasses)];

      if (!showPast) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        queries.push(new QueryCondition('dataFine', '>=', today.toISOString()));
      }

      const unsubscribe = this.$agenda.getAgenda4targetedClassesOnrealtime((events: AgendaEvent[]) => {
        this.fetchedEvents.set(events);
      }, queries);

      onCleanup(() => {
        if (unsubscribe) unsubscribe();
      });
    }
  });

}
