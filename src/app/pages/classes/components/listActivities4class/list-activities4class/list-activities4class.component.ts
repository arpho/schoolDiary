import { Component, effect, input, OnDestroy, signal, WritableSignal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActivityModel } from 'src/app/pages/activities/models/activityModel';
import { ActivitiesService } from 'src/app/pages/activities/services/activities.service';
import { QueryCondition } from 'src/app/shared/models/queryCondition';
import { UnsubscribeService } from 'src/app/shared/services/unsubscribe.service';
import { Subscription } from 'rxjs';
import {
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonButton,
  IonButtons,
  IonText,
  IonTextarea,
  ActionSheetController,
  ModalController,
  AlertController,
  ToastController,
  IonFab,
  IonFabButton
} from '@ionic/angular/standalone';
import {
  ellipsisVertical,
  create,
  trash,
  eye,
  close, calendarOutline,
  add
} from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { ActivityDialogComponent } from 'src/app/pages/activities/components/activityDialog/activity-dialog/activity-dialog.component';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ClasseModel } from 'src/app/pages/classes/models/classModel';
import { UsersService } from 'src/app/shared/services/users.service';
import { SubjectService } from 'src/app/pages/subjects-list/services/subjects/subject.service';
import { SubjectModel } from 'src/app/pages/subjects-list/models/subjectModel';
import { AssignedClass } from 'src/app/pages/subjects-list/models/assignedClass';

/**
 * Componente per visualizzare e gestire le attività (compiti, verifiche) di una classe.
 * Permette di filtrare per docente e visualizzare lo stato delle attività.
 */
@Component({
  selector: 'app-list-activities4class',
  templateUrl: './list-activities4class.component.html',
  styleUrls: ['./list-activities4class.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonFab,
    IonFabButton
  ]
})
export class ListActivities4classComponent implements OnDestroy {
  classkey = input.required<string>();
  teacherkey = input<string>('');
  activitieslist = signal<ActivityModel[]>([]);
  activitiesSubscription: Subscription = new Subscription();
  private $users = inject(UsersService);
  private $subjects = inject(SubjectService);

  constructor(
    private activitiesService: ActivitiesService,
    private actionSheetCtrl: ActionSheetController,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private router: Router
  ) {
    addIcons({ add, create, trash, close, calendarOutline });
    // Le icone sono registrate globalmente in app.module.ts
    console.log("activityies list")
    // Effetto che si attiva quando i valori cambiano
    effect(() => {
      const currentClassKey = this.classkey();
      const currentTeacherKey = this.teacherkey();
      console.log("currentClassKey", currentClassKey);
      console.log("currentTeacherKey", currentTeacherKey);
      this.updateActivities();
    });
  }

  /**
   * Mostra il menu delle azioni per un'attività
   */
  async showActions(activity: ActivityModel, event?: Event) {
    // Prevent default click behavior if event is provided
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Navigate to activity detail page


    // The following code will be used when we want to show the action sheet again
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Azioni',
      buttons: [
        {
          text: 'Modifica',
          icon: 'create',
          role: 'edit',
          handler: () => {
            this.editActivity(activity);
          }
        },
        {
          text: 'Elimina',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            this.confirmDelete(activity);
          }
        },
        {
          text: 'Annulla',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  /**
   * Visualizza i dettagli di un'attività
   */
  private viewActivity(activity: ActivityModel) {
    this.router.navigate(['/activity-details', activity.key]);
  }

  /**
   * Crea una nuova attività
   */
  async createActivity() {
    const user = await this.$users.getLoggedUser();
    let assignedClasses: AssignedClass[] = [];
    let subjects: SubjectModel[] = [];

    if (user && user.assignedClasses) {
      // Cast AssignedClass[] to ClasseModel[] since AssignedClass extends/is compatible in this context
      // or we map it if necessary. Based on UsersService, assignedClasses are populated with details.
      assignedClasses = user.assignedClasses as unknown as AssignedClass[];
      
      // Extract all unique subject keys from assigned classes
      // Adding safe navigation and logging. using reduce instead of flatMap for compatibility
      const allSubjectKeys = [...new Set(assignedClasses.reduce((acc: string[], c) => {
         return acc.concat(c.subjectsKey || []);
      }, []))];
      
      if (allSubjectKeys.length > 0) {
        subjects = await this.$subjects.fetchSubjectsByKeys(allSubjectKeys);
      }
    }


    // Fallback if no assigned classes found, use current one
    if (assignedClasses.length === 0 && this.classkey()) {
      // Create a minimal AssignedClass/ClasseModel
      const currentClass = new AssignedClass({ key: this.classkey() });
      assignedClasses = [currentClass];
    }

    const modal = await this.modalCtrl.create({
      component: ActivityDialogComponent,
      componentProps: {
        listaClassi: assignedClasses,
        listaMaterie: subjects,
        selectedClass: this.classkey()
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) { // Se data esiste (anche se non ha property saved esplicita, assumiamo sia l'oggetto salvato o flag)
       this.updateActivities();
    }
  }

  /**
   * Modifica un'attività esistente
   */
  private async editActivity(activity: ActivityModel) {
    // Carica i dettagli completi dell'attività
    const activityDetails = await this.activitiesService.getActivity(activity.key);
    
    const user = await this.$users.getLoggedUser();
    let assignedClasses: AssignedClass[] = [];
    let subjects: SubjectModel[] = [];

    if (user && user.assignedClasses) {
      assignedClasses = user.assignedClasses as unknown as AssignedClass[];
      
      // Extract all unique subject keys from assigned classes
      const allSubjectKeys = [...new Set(assignedClasses.reduce((acc: string[], c) => {
        return acc.concat(c.subjectsKey || []);
      }, []))];
      
      if (allSubjectKeys.length > 0) {
        subjects = await this.$subjects.fetchSubjectsByKeys(allSubjectKeys);
      }
    }
    
     if (assignedClasses.length === 0 && this.classkey()) {
      const currentClass = new AssignedClass({ key: this.classkey() });
      assignedClasses = [currentClass];
    }


    const modal = await this.modalCtrl.create({
      component: ActivityDialogComponent,
      componentProps: {
        activity: activityDetails,
        listaClassi: assignedClasses,
        listaMaterie: subjects, 
        selectedClass: this.classkey()
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data?.saved || data) {
      // Ricarica le attività se è stato salvato qualcosa
      this.updateActivities();
    }
  }

  /**
   * Conferma l'eliminazione di un'attività
   */
  private async confirmDelete(activity: ActivityModel) {
    const alert = await this.alertCtrl.create({
      header: 'Conferma eliminazione',
      message: `Sei sicuro di voler eliminare l'attività "${activity.title}"?`,
      buttons: [
        {

          text: 'Annulla',
          role: 'cancel'
        },

        {
          text: 'Elimina',
          role: 'destructive',
          handler: () => {
            this.deleteActivity(activity);
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Elimina un'attività
   */
  private async deleteActivity(activity: ActivityModel) {
    try {
      await this.activitiesService.deleteActivity(activity.key);
      this.showToast('Attività eliminata con successo');
    } catch (error) {
      console.error('Errore durante l\'eliminazione dell\'attività:', error);
      this.showToast('Si è verificato un errore durante l\'eliminazione', 'danger');
    }
  }

  /**
   * Mostra un toast di notifica
   */
  private async showToast(message: string, color: string = 'success') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });

    await toast.present();
  }

  private updateActivities() {
    console.log("update activities")
    const currentClassKey = this.classkey();
    const currentTeacherKey = this.teacherkey();
    console.log("currentClassKey", currentClassKey);
    console.log("currentTeacherKey", currentTeacherKey);
    if (!currentClassKey || !currentTeacherKey) {
      console.log("no classkey or teacherkey");
      return;
    }

    // Creo le condizioni di query
    const query: QueryCondition[] = [
      new QueryCondition('classKey', '==', currentClassKey),
      new QueryCondition('teacherKey', '==', currentTeacherKey)
    ];
    console.log("query", query)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    console.log(today.toISOString());
    // Sottoscrivo al servizio getActivitiesOnRealtime
    this.activitiesService.getActivities4teacherOnRealtime(
      currentTeacherKey,
      (activities: ActivityModel[]) => {
        console.log("activities", activities);
        this.activitieslist.set(activities);
      },
      query
    );
  }

  ngOnDestroy() {
    // Non è necessario pulire gli effects in Angular Signals
  }
}
