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
  ModalController
} from '@ionic/angular/standalone';
import { ClassiService } from 'src/app/pages/classes/services/classi.service';
import { AgendaEvent } from '../../models/agendaEvent';
import { AgendaService } from 'src/app/shared/services/agenda.service';
import { ClasseModel } from 'src/app/pages/classes/models/classModel';
import { AgendaDisplayComponent } from 'src/app/shared/components/agenda-display/agenda-display.component';
import { addIcons } from 'ionicons';
import { add } from 'ionicons/icons';
import { EventDialogComponent } from '../event-dialog/event-dialog.component';
import { QueryCondition } from 'src/app/shared/models/queryCondition';

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
    AgendaDisplayComponent
  ]
})
export class DisplayAgenda4ClassesComponent {
  targetedClasses = input.required<string[]>();
  title = signal<string>('');
  agenda = signal<AgendaEvent[]>([])
  listaClassi = signal<ClasseModel[]>([]);

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
    addIcons({ add });
  }

  // Effect as field initializer - runs in injection context
  private classesEffect = effect(async () => {
    const targetedClasses = this.targetedClasses();
    if (targetedClasses.length > 0 && targetedClasses[0]) {
    }
    const classPromises = targetedClasses.map((classKey) => {
      if (!this.$classes) {
        throw new Error('ClassiService non inizializzato');
      }
      return this.$classes.fetchClasseOnCache(classKey);
    });
    const classes = await Promise.all(classPromises);
    const title = classes.length > 1 ?
      `agenda per le classi: ${classes.map((classe) => classe?.classe).join(', ')}` : `agenda per ${classes[0]?.classe}`;
    this.title.set(title);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    console.log("today", today.toISOString());
    this.$agenda.getAgenda4targetedClassesOnrealtime((events: AgendaEvent[]) => {
      this.agenda.set(events);
    }, [
      new QueryCondition('classKey', 'in', targetedClasses),

      //  new QueryCondition('dataInizio', '>=', today.toISOString())
    ]);
  });

}
