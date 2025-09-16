import { Component, OnInit, Input, computed, OnChanges, SimpleChanges } from '@angular/core';
import { signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonList, IonItem, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonFab, IonFabButton, IonFabList, IonIcon, IonButton,  IonTextarea  } from '@ionic/angular/standalone';
import { UserModel } from 'src/app/shared/models/userModel';
import { UsersService } from 'src/app/shared/services/users.service';
import { addIcons } from 'ionicons';
import {
   create,
   ellipsisVertical,
   sparkles,
   close,
   trash,
   eye,
   add
  } from 'ionicons/icons';
import { cloudUploadOutline } from 'ionicons/icons';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { UploadStudentsComponent } from '../uploadStudents/upload-students/upload-students.component';
import { UserDialogPage } from '../../../users/user-dialog/user-dialog.page';

@Component({
  selector: 'app-list-student4class',
  templateUrl: './list-student4class.component.html',
  styleUrls: ['./list-student4class.component.scss'],
  standalone: true,
  imports: [
    IonList,
    IonItem,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonFab,
    IonFabButton,
    IonFabList,
    IonIcon,
    IonButton,
  
]
})
export class ListStudent4classComponent implements OnInit, OnChanges {
async addStudent() {
  const modal = await this.$modalController.create({
    component: UserDialogPage,
    componentProps: {
      classKey: this.classkey
    }
  });
  
  await modal.present();
  
  const { data } = await modal.onWillDismiss();
  if (data) {
    this.loadStudents(); // Ricarica gli studenti se ne è stato aggiunto uno nuovo
  }
}
  @Input() set classkey(value: string) {
    this._classkey = value;
    if (value) {
      this.loadStudents();
    }
  }
  get classkey(): string {
    return this._classkey;
  }
  private _classkey: string = '';
  async uploadStudents() {
const modal = await this.$modalController.create({
  component: UploadStudentsComponent,
  componentProps: {
    classkey: this.classkey
  }
});
await modal.present();
}
newEvaluation(studentKey: string) {
  this.router.navigate(['/evaluation',studentKey,this.classkey]);
}

  constructor(
    private $users: UsersService,
    private router: Router,
    private $modalController: ModalController,
    private route: ActivatedRoute
  ) {
    addIcons({
      cloudupload: cloudUploadOutline,add
    })
  }
deleteStudent(arg0: string) {
throw new Error('Method not implemented.');
}
editStudent(arg0: string) {
this.router.navigate(['/user-dialog',arg0]);
}

  readonly _students = signal<UserModel[]>([]);
  sortedStudents = computed(() => {
    const makeFullName = (user: UserModel) => `${user.lastName} ${user.firstName}`;
    return this._students().sort((a, b) => makeFullName(a).localeCompare(makeFullName(b)));
  });

  get students(): UserModel[] {
    return this._students();
  }

  private setStudents(users: UserModel[]): void {
    console.log("setStudents*", users, "for class", this.classkey);
    this._students.set(users);
  }

  ngOnInit() {
    if (this.classkey) {
      this.loadStudents();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['classkey'] && !changes['classkey'].firstChange) {
      this.loadStudents();
    }
  }

  private loadStudents() {
    console.log("Loading students for class:", this.classkey);
    this.$users.getUsersByClass(this.classkey, (users: UserModel[]) => {
      this.setStudents(users);
    });
  }

}
