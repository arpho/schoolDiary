import { Component, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { md5 } from '../../utils/md5';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { 
  IonButton, 
  IonIcon, 
  IonPopover, 
  IonContent, 
  IonList, 
  IonItem, 
  IonLabel, 
  IonAvatar, 
  IonText 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personCircleOutline,
  logOutOutline,
  keyOutline,
  personOutline
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
    CommonModule,
    RouterModule,
    IonButton,
    IonIcon,
    IonPopover,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonAvatar,
    IonText
  ]
})
export class LogoutComponent implements OnInit {
  openProfile() {
    const userKey = this.loggedUser()?.key;
    this.router.navigate(['/profile', userKey]);
  }
  loggedUser = signal<UserModel>(new UserModel());
  constructor(
    private $user: UsersService,
    private router: Router
  ) {
    addIcons({
      personCircleOutline,
      logOutOutline,
      keyOutline,
      personOutline
    });
  }

  gravatarUrl = signal<string>('');

  async ngOnInit() {
    const user = await this.$user.getLoggedUser();
    console.log("user", user);
    if (user) {
      this.loggedUser.set(user);
      if (user.email) {
        const hash = md5(user.email.trim().toLowerCase());
        this.gravatarUrl.set(`https://www.gravatar.com/avatar/${hash}?d=mp&s=200`);
      }
      const claims = await this.$user.getCustomClaims4LoggedUser();
      console.log("claims", claims);
    }
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
