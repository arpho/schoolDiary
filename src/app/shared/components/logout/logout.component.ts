import { Component, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { IonFabButton, IonIcon, IonFab, IonFabList } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  bodyOutline,
  ellipsisVertical,
  key,
  logOut,
  person
} from 'ionicons/icons';
import { UsersService } from 'src/app/shared/services/users.service';
import { Router } from '@angular/router';
import { UserModel } from 'src/app/shared/models/userModel';
@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonIcon,
    IonFabButton,
    IonFab,
    IonFabList
  ]
})
export class LogoutComponent implements OnInit {
 openProfile() {
const userKey= this.loggedUser()?.key;
this.router.navigate(['/profile',userKey]);
}
  loggedUser= signal<UserModel>(new UserModel());
  constructor(
    private $user: UsersService,
    private router: Router
  ) { 
    addIcons({
      ellipsisVertical,
      logOut,
      key,
      person,
      bodyOutline
    });
  }

  async ngOnInit() {
    const user= await this.$user.getLoggedUser();
    console.log("user",user)
    this.loggedUser.set(user);
    const claims= await this.$user.getCustomClaims4LoggedUser();
    console.log("claims",claims)
  }

  async logout() {
    try {
      await this.$user.logout();
      this.router.navigate(['/login']);
      // Il router per la navigazione alla pagina di login
      // viene gestito dal listener di autenticazione in app.component
    } catch (error) {
      console.error('Errore durante il logout:', error);
    }
  }

  changePassword() {
    throw new Error('Method not implemented.');
  }
}
