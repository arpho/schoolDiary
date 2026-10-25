import { Component, OnInit, signal, inject, effect, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonList, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonIcon, IonFab, IonFabButton, IonFabList, IonBackButton, IonButtons, IonCardSubtitle, IonButton, AlertInput, IonSelect, IonSelectOption, IonGrid, IonRow, IonCol } from '@ionic/angular/standalone';
import { ActivityModel } from '../models/activityModel';
import { UsersService } from '../../../shared/services/users.service';
import { UserModel } from '../../../shared/models/userModel';
import { ActivitiesService } from '../services/activities.service';
import { SubjectService } from 'src/app/pages/subjects-list/services/subjects/subject.service';
import { SubjectModel } from 'src/app/pages/subjects-list/models/subjectModel';
import { QueryCondition } from 'src/app/shared/models/queryCondition';
import { ClasseModel } from 'src/app/pages/classes/models/classModel';
import { ClassiService } from 'src/app/pages/classes/services/classi.service';
import { ActionSheetController, AlertController, ModalController, ToastController } from '@ionic/angular';
import { ActivityDialogComponent } from '../components/activityDialog/activity-dialog/activity-dialog.component';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { add, close, create, eye, trash } from 'ionicons/icons';


/**
 * Pagina principale per la visualizzazione delle attività.
 * Permette ai docenti di visualizzare, filtrare e creare nuove attività.
 */
@Component({
  selector: 'app-activities-list',
  templateUrl: './activities-list.page.html',
  styleUrls: ['./activities-list.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonItem,
    IonList,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonIcon,
    IonFab,
    IonFabButton,
    IonFabList,
    IonBackButton,
    IonButtons,
    IonCardSubtitle,
    IonButton,
    DatePipe,
    IonSelect,
    IonSelectOption,
    IonGrid,
    IonRow,
    IonCol
  ]
})
export class ActivitiesListPage implements OnInit, OnDestroy {

  activity = signal<ActivityModel>(new ActivityModel({
    title: '',
    description: '',
    classKey: '',
    date: new Date().toISOString(),
    teacherKey: ''
  }));
  private usersService = inject(UsersService);
  private activitiesService = inject(ActivitiesService);
  private classiService = inject(ClassiService);
  private classesList = signal<ClasseModel[]>([]);
  private modalController = inject(ModalController);
  private actionSheetCtrl = inject(ActionSheetController);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private router = inject(Router);
  private subjectService = inject(SubjectService);
  selectedClassKey = signal<string>('all');
  selectedSubjectKey = signal<string>('all');
  subjectsList = signal<SubjectModel[]>([]);
  private activitiesSubscription?: () => void;


  constructor() {
    addIcons({ add, create, trash, eye, close });

    effect(async () => {
      const user = this.loggedUser();
      if (user?.classes && user.classesKey.length > 0) {
        const classKeys = user.classesKey as string[];
        const classPromises = classKeys.map((classKey) => this.classiService.fetchClasseOnCache(classKey));
        const classResults = await Promise.all(classPromises);
        const classi = classResults.filter((classe): classe is ClasseModel => classe !== undefined);
        this.classesList.set(classi);
      } else if (user?.assignedClasses?.length) {
        this.classesList.set(user.assignedClasses as unknown as ClasseModel[]);
      }
    });
  }

  private getAvailableClasses(): ClasseModel[] {
    if (this.classesList().length > 0) {
      return this.classesList();
    }
    return (this.loggedUser()?.assignedClasses as unknown as ClasseModel[]) || [];
  }

  /**
   * Apre il modale per creare una nuova attività.
   * Salva l'attività se il modale viene chiuso con successo.
   */
  async newActivity() {
    const user = await this.usersService.getLoggedUser();
    const initialClassKey = this.selectedClassKey() !== 'all' ? this.selectedClassKey() : '';
    const initialActivity = new ActivityModel({
      title: '',
      description: '',
      classKey: initialClassKey,
      date: new Date().toISOString(),
      teacherKey: user?.key || ''
    }).setTeacherKey(user?.key || '');

    const modal = await this.modalController.create({
      component: ActivityDialogComponent,
      componentProps: {
        listaClassi: this.getAvailableClasses(),
        listaMaterie: this.subjectsList(),
        selectedClass: initialClassKey,
        activity: initialActivity
      }
    });
    await modal.present();
    const result = modal.onWillDismiss ? await modal.onWillDismiss() : await modal.onDidDismiss();
    if (result?.data && result.role !== 'cancel') {
      try {
        const rawActivity = result.data.activity ?? result.data;
        const createdActivity = rawActivity instanceof ActivityModel
          ? rawActivity
          : new ActivityModel(rawActivity);
        const saved = await this.activitiesService.addActivity(createdActivity);
        this.activitiesList.update(list => {
          const exists = list.some(a => a.key === saved.key);
          return exists ? list.map(a => a.key === saved.key ? saved : a) : [saved, ...list];
        });
        await this.showToast('Attività creata con successo');
      } catch (error) {
        console.error('Errore durante la creazione dell\'attività:', error);
        await this.showToast('Si è verificato un errore durante la creazione', 'danger');
      }
    }
  }

  /**
   * Mostra il menu delle azioni per un'attività selezionata.
   */
  async showActions(activity: ActivityModel, event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Azioni',
      buttons: [
        {
          text: 'Visualizza Valutazioni',
          icon: 'eye',
          handler: () => {
            this.router.navigate(['/evaluations4-activity', activity.key]);
          }
        },
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
   * Apre il modale per modificare un'attività esistente e salva le modifiche.
   */
  async editActivity(activity: ActivityModel) {
    const activityDetails = (await this.activitiesService.getActivity(activity.key)) || activity;
    const modal = await this.modalController.create({
      component: ActivityDialogComponent,
      componentProps: {
        activity: activityDetails,
        listaClassi: this.getAvailableClasses(),
        listaMaterie: this.subjectsList(),
        selectedClass: activityDetails.classKey
      }
    });

    await modal.present();
    const result = modal.onWillDismiss ? await modal.onWillDismiss() : await modal.onDidDismiss();
    if (result?.data && result.role !== 'cancel') {
      try {
        const rawActivity = result.data.activity ?? result.data;
        const updatedActivity = rawActivity instanceof ActivityModel
          ? rawActivity
          : new ActivityModel(rawActivity);
        const keyToUpdate = updatedActivity.key || activity.key;
        updatedActivity.setKey(keyToUpdate);
        await this.activitiesService.updateActivity(keyToUpdate, updatedActivity);
        this.activitiesList.update(list =>
          list.map(a => a.key === keyToUpdate ? updatedActivity : a)
        );
        await this.showToast('Attività aggiornata con successo');
      } catch (error) {
        console.error('Errore durante l\'aggiornamento dell\'attività:', error);
        await this.showToast('Si è verificato un errore durante l\'aggiornamento', 'danger');
      }
    }
  }

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

  private async deleteActivity(activity: ActivityModel) {
    try {
      await this.activitiesService.deleteActivity(activity.key);
      this.activitiesList.update(list => list.filter(a => a.key !== activity.key));
      await this.showToast('Attività eliminata con successo');
    } catch (error) {
      console.error('Errore durante l\'eliminazione dell\'attività:', error);
      await this.showToast('Si è verificato un errore durante l\'eliminazione', 'danger');
    }
  }

  private async showToast(message: string, color: string = 'success') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }

  activitiesList = signal<ActivityModel[]>([]);
  loggedUser = signal<UserModel | null>(null);

  /**
   * Restituisce una stringa formattata con nome e anno della classe.
   * @param classKey Chiave della classe.
   * @returns Stringa formattata (es. "1 A").
   */
  seeClass(classKey: string): string {
    const classe = this.classesList().find(c => c.key === classKey)
      || this.loggedUser()?.assignedClasses?.find(c => c.key === classKey);
    return classe ? `${classe.classe} ${classe.year}` : '';
  }



  /**
   * Inizializza il componente, carica l'utente, le materie e le attività.
   */
  async ngOnInit() {
    const user = await this.usersService.getLoggedUser();
    if (user) {
      this.loggedUser.set(user);

      // Load unique subjects from assigned classes
      if (user.assignedClasses) {
        const allSubjectKeys = user.assignedClasses.reduce((acc, c) => acc.concat(c.subjectsKey || []), [] as string[]);
        const subjectKeys = Array.from(new Set(allSubjectKeys));
        const subjects = await this.subjectService.fetchSubjectsByKeys(subjectKeys);
        this.subjectsList.set(subjects);
      }

      this.loadActivities();
    }
  }

  /**
   * Carica le attività applicando i filtri (classe e materia).
   * Aggiorna la lista in tempo reale.
   */
  loadActivities() {
    const user = this.loggedUser();
    if (!user) return;

    if (this.activitiesSubscription) {
      this.activitiesSubscription();
    }

    const classKey = this.selectedClassKey();
    const subjectKey = this.selectedSubjectKey();

    let conditions: QueryCondition[] = [];

    // Class filter
    if (classKey !== 'all') {
      conditions.push(new QueryCondition('classKey', '==', classKey));
    } else {
      const allClassKeys = Array.from(new Set([
        ...(user.classesKey || []),
        ...(user.assignedClasses?.map(c => c.key).filter(Boolean) || [])
      ]));
      if (allClassKeys.length > 0 && allClassKeys.length <= 30) {
        conditions.push(new QueryCondition('classKey', 'in', allClassKeys));
      }
    }

    // Subject filter
    if (subjectKey !== 'all') {
      conditions.push(new QueryCondition('subjectsKey', '==', subjectKey));
    }

    this.activitiesSubscription = this.activitiesService.getActivities4teacherOnRealtime(
      user.key,
      (activities: ActivityModel[]) => {
        console.log("activities", activities);
        this.activitiesList.set(activities);
      },
      conditions
    );
  }

  onClassChange(event: any) {
    this.selectedClassKey.set(event.detail.value);
    this.loadActivities();
  }

  onSubjectChange(event: any) {
    this.selectedSubjectKey.set(event.detail.value);
    this.loadActivities();
  }

  ngOnDestroy() {
    if (this.activitiesSubscription) {
      this.activitiesSubscription();
    }
  }

}
