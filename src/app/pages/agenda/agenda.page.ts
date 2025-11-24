import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton } from '@ionic/angular/standalone';
import { AgendaDisplayComponent } from '../../shared/components/agenda-display/agenda-display.component';
import { UsersService } from '../../shared/services/users.service';

@Component({
  selector: 'app-agenda',
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/dashboard"></ion-back-button>
        </ion-buttons>
        <ion-title>Agenda Globale</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Agenda Globale</ion-title>
        </ion-toolbar>
      </ion-header>

      <app-agenda-display *ngIf="teacherKey()" [teacherKey]="teacherKey()"></app-agenda-display>
    </ion-content>
  `,
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, AgendaDisplayComponent, IonButtons, IonBackButton]
})
export class AgendaPage implements OnInit {
  private usersService = inject(UsersService);
  teacherKey = signal<string>('');

  async ngOnInit() {
    const user = await this.usersService.getLoggedUser();
    if (user) {
      this.teacherKey.set(user.key);
    }
  }
}
