import { Component, OnInit, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
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
  lockClosedOutline,
  personOutline,
  keyOutline,
  listOutline
} from 'ionicons/icons';
import { UsersService } from 'src/app/shared/services/users.service';
import { LocalLockService } from 'src/app/shared/services/local-lock.service';
import { UserModel } from 'src/app/shared/models/userModel';
import { Md5 } from 'ts-md5';

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss'],
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
export class UserMenuComponent implements OnInit {
  private usersService = inject(UsersService);
  private localLockService = inject(LocalLockService);
  private router = inject(Router);

  loggedUser = signal<UserModel>(new UserModel());
  gravatarUrl = signal<string>('');

  constructor() {
    addIcons({
      personCircleOutline,
      logOutOutline,
      lockClosedOutline,
      personOutline,
      keyOutline,
      listOutline
    });
  }

  async ngOnInit() {
    const user = await this.usersService.getLoggedUser();
    if (user) {
      this.loggedUser.set(user);
      if (user.email) {
        const hash = Md5.hashStr(user.email.trim().toLowerCase());
        this.gravatarUrl.set(`https://www.gravatar.com/avatar/${hash}?d=mp&s=200`);
      }
    }
  }

  openProfile() {
    const userKey = this.loggedUser()?.key;
    if (userKey) {
      this.router.navigate(['/profile', userKey]);
    }
  }

  openChangelog() {
    this.router.navigate(['/changelog']);
  }

  lockApp() {
    this.localLockService.lockManually();
    this.router.navigate(['/lock-screen']);
  }

  async logout() {
    try {
      this.localLockService.clearLock();
      await this.usersService.logout();
      // Effettuiamo un ricaricamento completo della pagina verso la login
      // Questo è il modo più sicuro per pulire tutti i singleton, le cache dei servizi
      // e lo stato globale dell'applicazione, evitando leak di dati tra sessioni.
      window.location.href = '/login';
    } catch (error) {
      console.error('Errore durante il logout:', error);
    }
  }
}
