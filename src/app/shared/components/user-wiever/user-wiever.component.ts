import { Component, input, signal, inject } from '@angular/core';
import { UsersService } from '../../services/users.service';
import { UserModel } from '../../models/userModel';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonLabel } from "@ionic/angular/standalone";

@Component({
  selector: 'app-user-wiever',
  templateUrl: './user-wiever.component.html',
  styleUrls: ['./user-wiever.component.scss'],
  imports: [IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonLabel],
})
export class UserWieverComponent {
  private usersService = inject(UsersService);
  userkey = input<string>();
  user = signal<UserModel | undefined>(undefined);

  constructor() {
    this.updateUser();
  }

  updateUser() {
    const key = this.userkey();
    if (key) {
      this.user.set(this.usersService.fetchUserOnCache(key));
    }
  }

  ngOnChanges() {
    this.updateUser();
  }
}
