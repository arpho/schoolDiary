import { Component, OnInit, Input } from '@angular/core';
import { signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
IonList,
IonItem,
IonCard,
IonCardContent,
IonCardHeader,
IonCardTitle,
IonFab,
IonFabButton,
IonFabList,
IonIcon
} from '@ionic/angular/standalone';
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
  } from 'ionicons/icons';
import { ActivatedRoute, Router } from '@angular/router';

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
    IonIcon
  ]
})
export class ListStudent4classComponent  implements OnInit {
newEvaluation(studentKey: string) {
  this.router.navigate(['/evaluation',studentKey,this.classkey]);
}

  constructor(
    private $users: UsersService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    addIcons({
      ellipsisVertical,
      create,
      eye,
      sparkles,
      close,
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
