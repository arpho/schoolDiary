import { Component, inject, OnDestroy, OnInit } from '@angular/core';
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
  IonIcon, 
  IonText, 
  IonFabButton, 
  IonFab,
  ModalController
} from '@ionic/angular/standalone';
import { SubjectModel } from './models/subjectModel';
import { signal } from '@angular/core';
import { UnsubscribeService } from 'src/app/shared/services/unsubscribe.service';
import { SubjectService } from './services/subjects/subject.service';
import { addIcons } from 'ionicons';
import { add, addOutline, bookOutline } from 'ionicons/icons';
import { CreateSubjectPage } from './pages/create-subject/create-subject.page';

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
      const newSubject = new SubjectModel({
        name: data.name,
        color: data.color,
        // Altri campi predefiniti
        description: '',
        icon: 'book-outline',
        classeDiConcorso: data.classeDiConcorso
      });
     console.log("newSubject ",newSubject) 
   //   this.$subjects.createSubject(newSubject);
    }
  }
  subjectsList = signal<SubjectModel[]>([]);
  private unsubscribe = inject(UnsubscribeService);
  private $subjects = inject(SubjectService);

  constructor(
    private modalCtrl: ModalController
  ) {
    addIcons({bookOutline,add});
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