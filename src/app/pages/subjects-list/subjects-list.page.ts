import { Component, inject, OnDestroy, OnInit, ɵflushModuleScopingQueueAsMuchAsPossible } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonText,
  IonFabButton,
  IonFab,
  ModalController,
  IonButtons,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonBackButton,
  IonItemSliding as IonItemSlidingType
} from '@ionic/angular/standalone';
import { SubjectModel } from './models/subjectModel';
import { signal } from '@angular/core';
import { UnsubscribeService } from 'src/app/shared/services/unsubscribe.service';
import { SubjectService } from './services/subjects/subject.service';
import { addIcons } from 'ionicons';
import { add, addOutline, bookOutline, createOutline, trashOutline } from 'ionicons/icons';
import { CreateSubjectPage } from './pages/create-subject/create-subject.page';
import { ToasterService } from 'src/app/shared/services/toaster.service';
import { Subject } from 'rxjs';

/**
 * Pagina principale che lista tutte le materie configurate nel sistema.
 * Permette di aggiungere, modificare ed eliminare le materie.
 */
@Component({
  selector: 'app-subjects-list',
  templateUrl: './subjects-list.page.html',
  styleUrls: ['./subjects-list.page.scss'],
  standalone: true,
  imports: [
    // Componenti Ionic
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonText,
    IonFabButton,
    IonFab,
    IonBackButton,
    IonButtons,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    // Moduli Angular
    CommonModule,
    FormsModule
  ],
  providers: [UnsubscribeService]
})
export class SubjectsListPage implements OnInit, OnDestroy {
  /**
   * Apre il modale per creare una nuova materia.
   */
  async addSubject() {
    const modal = await this.modalCtrl.create({
      component: CreateSubjectPage,
      cssClass: 'create-subject-modal'
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();

    if (data) {
      try {
        const newSubject = new SubjectModel({
          name: data.name,
          color: data.color,
          // Altri campi predefiniti
          description: '',
          icon: 'book-outline',
          classeDiConcorso: data.classeDiConcorso || ''
        });

        await this.$subjects.createSubject(newSubject);

        this.toaster.showToast({
          message: 'Materia creata con successo!',
          duration: 2000,
          position: 'top'
        }, 'success');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Si è verificato un errore durante la creazione della materia';
        console.error('Errore durante la creazione della materia:', error);
        this.toaster.showToast({
          message: errorMessage,
          duration: 3000,
          position: 'top'
        }, 'danger');
      }
    }
  }
  subjectsList = signal<SubjectModel[]>([]);
  private unsubscribe = inject(UnsubscribeService);
  private $subjects = inject(SubjectService);

  /**
   * Apre il modale per modificare una materia esistente.
   * @param subject La materia da modificare.
   * @param slidingItem L'elemento della lista che contiene l'opzione di modifica (per chiuderlo dopo l'azione).
   */
  async editSubject(subject: SubjectModel, slidingItem: IonItemSlidingType) {
    // Chiudi lo sliding item
    await slidingItem.close();

    // Crea una copia dell'oggetto per evitare modifiche dirette
    const subjectCopy = signal(new SubjectModel(subject));

    const modal = await this.modalCtrl.create({
      component: CreateSubjectPage,
      componentProps: {
        'subject': subjectCopy
      }
    });

    modal.onDidDismiss().then((result) => {
      if (result.role === 'confirm') {
        const editedSubject = subjectCopy()
        console.log("editedSubject", editedSubject)
        this.$subjects.updateSubject(editedSubject)
          .then(() => this.toaster.showToast({
            message: 'Materia aggiornata con successo!',
            duration: 2000,
            position: 'top'
          }, 'success'))
          .catch((error) => {
            console.error('Errore durante l\'aggiornamento della materia:', error);
            this.toaster.showToast({
              message: 'Si è verificato un errore durante l\'aggiornamento della materia',
              duration: 3000,
              position: 'top'
            }, 'danger');
          });
      }
    });

    await modal.present();
  }

  /**
   * Elimina una materia.
   * @param subject La materia da eliminare.
   * @param slidingItem L'elemento della lista (per chiuderlo).
   */
  async deleteSubject(subject: SubjectModel, slidingItem: IonItemSlidingType) {
    try {
      // Chiudi lo sliding item
      await slidingItem.close();

      if (subject.key) {
        await this.$subjects.deleteSubject(subject.key);
        this.toaster.showToast({
          message: 'Materia eliminata con successo',
          duration: 2000,
          position: 'top'
        }, 'success');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Si è verificato un errore durante l\'eliminazione della materia';
      this.toaster.showToast({
        message: errorMessage,
        duration: 3000,
        position: 'top'
      }, 'danger');
    }
  }

  constructor(
    private modalCtrl: ModalController,
    private toaster: ToasterService
  ) {
    addIcons({ bookOutline, add, createOutline, trashOutline });
  }

  ngOnInit() {
    const subscription = this.$subjects.fetchSubjectListOnRealTime(
      (subjects: SubjectModel[]) => {
        console.log("Raw subjects from Firestore:", JSON.parse(JSON.stringify(subjects)));
        console.log("Subjects count:", subjects.length);
        console.log("Subjects keys:", subjects.map(s => s.key));

        this.subjectsList.set([...subjects]);
      }
    );
    this.unsubscribe.add(subscription);
  }

  ngOnDestroy() {
    this.unsubscribe.clear();
  }

  trackSubjectByKey(index: number, subject: SubjectModel): string {
    return subject.key || index.toString();
  }

}