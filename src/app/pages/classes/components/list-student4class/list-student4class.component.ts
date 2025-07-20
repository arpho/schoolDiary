import { Component, OnInit, Input } from '@angular/core';
import { signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { IonList, IonItem, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonFab, IonFabButton, IonFabList, IonIcon } from '@ionic/angular/standalone';
import { UserModel } from 'src/app/shared/models/userModel';
import { UsersService } from 'src/app/shared/services/users.service';

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
deleteStudent(arg0: string) {
throw new Error('Method not implemented.');
}
editStudent(arg0: string) {
throw new Error('Method not implemented.');
}
  @Input() classkey!: string;
  readonly _students = signal<UserModel[]>([]);

  get students(): UserModel[] {
    return this._students();
  }

  private setStudents(users: UserModel[]): void {
    this._students.set(users);
  }

  constructor(
    private $users: UsersService,
  ) { }

  ngOnInit() {
    this.$users.getUsersByClass(this.classkey, (users: UserModel[]) => {
        this.setStudents(users);
    });
  }

}
