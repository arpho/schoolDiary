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
  IonItemOption
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

  async editSubject(subject: SubjectModel) {
    // Crea una copia dell'oggetto per evitare modifiche dirette
    const subjectCopy = signal(new SubjectModel(subject));
    
    const modal = await this.modalCtrl.create({
      component: CreateSubjectPage,
      componentProps: {
        // Usa la sintassi con parentesi quadre per il binding bidirezionale
        'subject': subjectCopy
      }
    });

    modal.onDidDismiss().then((result) => {
      if (result.role === 'confirm') {
        // Non è più necessario gestire result.data poiché il model è già aggiornato
        // grazie al binding bidirezionale
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

  async deleteSubject(subject: SubjectModel) {
    try {
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
    addIcons({ 
      bookOutline, 
      add,
      'create-outline': createOutline,
      'trash-outline': trashOutline
    });
  }

  ngOnInit() {
   const subscription = this.$subjects.fetchSubjectListOnRealTime(
      (subjects: SubjectModel[]) => {
        this.subjectsList.set(subjects);
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