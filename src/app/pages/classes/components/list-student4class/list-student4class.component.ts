import { Component, OnInit, Input } from '@angular/core';
import { signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonList, IonItem, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonFab, IonFabButton, IonFabList, IonIcon, IonButton } from '@ionic/angular/standalone';
import { UserModel } from 'src/app/shared/models/userModel';
import { UsersService } from 'src/app/shared/services/users.service';
import { addIcons } from 'ionicons';
import {
   create,
   ellipsisVertical,
   sparkles,
   close,
   trash,
   eye
  } from 'ionicons/icons';
import { cloudUploadOutline } from 'ionicons/icons';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { UploadStudentsComponent } from '../uploadStudents/upload-students/upload-students.component';

@Component({
  selector: 'app-list-student4class',
  templateUrl: './list-student4class.component.html',
  styleUrls: ['./list-student4class.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
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
    IonButton
]
})
export class ListStudent4classComponent  implements OnInit {
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
      cloudupload: cloudUploadOutline
    })
  }
deleteStudent(arg0: string) {
throw new Error('Method not implemented.');
}
editStudent(arg0: string) {
this.router.navigate(['/user-dialog',arg0]);
}
  @Input() classkey!: string;
  readonly _students = signal<UserModel[]>([]);

  get students(): UserModel[] {
    return this._students();
  }

  private setStudents(users: UserModel[]): void {
    this._students.set(users);
  }

  ngOnInit() {
    this.$users.getUsersByClass(this.classkey, (users: UserModel[]) => {
        this.setStudents(users);
    });
  }

}
