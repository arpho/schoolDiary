import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { UsersService } from 'src/app/shared/services/users.service';
import { UserModel } from 'src/app/shared/models/userModel';
import { signal } from '@angular/core';
@Component({
  selector: 'app-user-dialog',
  templateUrl: './user-dialog.page.html',
  styleUrls: ['./user-dialog.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class UserDialogPage implements OnInit {
  userKey = "";
userSignal = signal(new UserModel());
  constructor(
    private router: Router,
    private $users: UsersService, 
  ) { }

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    this.userKey = navigation?.extras.state?.['userKey'];
    if(this.userKey){
      this.$users.fetchUser(this.userKey).then((user) => {
        if(user){
        this.userSignal.set(user);
      }
      });
    }
    console.log("userKey", this.userSignal());

  }

}
