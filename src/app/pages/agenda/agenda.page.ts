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
  ModalController,
  IonLabel
} from '@ionic/angular/standalone';
import { UsersService } from '../../shared/services/users.service';
import { AgendaListComponent } from './components/agenda-list/agenda-list.component';
import { AgendaSchedulerComponent } from './components/agenda-scheduler/agenda-scheduler.component';
import { AgendaService } from 'src/app/shared/services/agenda.service';
import { ClassiService } from 'src/app/pages/classes/services/classi.service';
import { AgendaEvent } from './models/agendaEvent';
import { ClasseModel } from '../classes/models/classModel';
import { QueryCondition } from 'src/app/shared/models/queryCondition';
import { addIcons } from 'ionicons';
import { add, calendar, list } from 'ionicons/icons';
import { EventDialogComponent } from './components/event-dialog/event-dialog.component';

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
    AgendaSchedulerComponent
  ]
})
export class AgendaPage implements OnInit {
  private usersService = inject(UsersService);
  private agendaService = inject(AgendaService);
  private classiService = inject(ClassiService);
  private modalCtrl = inject(ModalController);

  teacherKey = signal<string>('');
  targetedClasses = signal<string[]>([]);
  listaClassi = signal<ClasseModel[]>([]);
  agenda = signal<AgendaEvent[]>([]);
  
  viewMode = signal<'list' | 'scheduler'>('list');
  viewModeLabel = computed(() => this.viewMode() === 'list' ? 'Lista' : 'Calendario');
  pageTitle = signal<string>('agenda');

  constructor() {
    addIcons({ add, calendar, list });
    this.initialize();
    
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

        // Fetch Agenda Events
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        this.agendaService.getAgenda4targetedClassesOnrealtime((events: AgendaEvent[]) => {
          this.agenda.set(events);
        }, [
          new QueryCondition('classKey', 'in', targetedClasses),
          new QueryCondition('dataFine', '>=', today.toISOString())
        ]);
      }
    });
  }

  async initialize() {
    const user = await this.usersService.getLoggedUser();
    if (user) {
      this.teacherKey.set(user.key);
      this.targetedClasses.set(user.classesKey);
    }
  }

  ngOnInit() {}

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

  toggleView(event: any) {
    this.viewMode.set(event.detail.checked ? 'scheduler' : 'list');
  }
}
