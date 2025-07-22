import { Component, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
  IonList,
  IonItem,
  IonFab,
  IonFabButton,
  IonFabList,
  IonBackButton
} from '@ionic/angular/standalone';
import { UserModel } from 'src/app/shared/models/userModel';
import { UsersService } from 'src/app/shared/services/users.service';
import { addIcons } from 'ionicons';
import {
   add,
   create,
   close,
   save,
   trash,
   ellipsisVertical } from 'ionicons/icons';
import { Router } from '@angular/router';
import { ToasterService } from 'src/app/shared/services/toaster.service';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.page.html',
  styleUrls: ['./users-list.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonItem,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonIcon,
    IonItem,
    IonList,
    IonFab,
    IonFabButton,
    IonFabList,
    IonBackButton
  ]
})
export class UsersListPage implements OnInit {
deleteUser(userKey: string) {
console.log("deleteUser", userKey);
}
editUser(userKey: string) {
  this.router.navigate(['user-dialog',userKey]);
}

  userList= signal<UserModel[]>([]);
  usersFilter= signal<()=> UserModel[]>(()=>this.userList());
  users2BeShown= computed(()=>this.usersFilter()());

  constructor(
    private usersService: UsersService,
    private router: Router,
    private toaster: ToasterService
  ) {
    addIcons({
      ellipsisVertical,
      create,
      close,
      save,
      trash,
    });
  }

  ngOnInit() {
    const cb = (users: UserModel[]) => {
      this.userList.set(users);
    }
    this.usersService.getUsersOnRealTime(cb)
  }

}
