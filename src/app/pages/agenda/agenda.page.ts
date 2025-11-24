import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton } from '@ionic/angular/standalone';
import { AgendaDisplayComponent } from '../../shared/components/agenda-display/agenda-display.component';
import { UsersService } from '../../shared/services/users.service';
import { DisplayAgenda4ClassesComponent } from './components/display-agenda4-classes/display-agenda4-classes.component';

@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.page.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    AgendaDisplayComponent,
    IonButtons,
    IonBackButton,
    DisplayAgenda4ClassesComponent]
})
export class AgendaPage implements OnInit {
  private usersService = inject(UsersService);
  teacherKey = signal<string>('');
  targetedClasses = signal<string[]>([]);
  constructor() {
    this.initialize();
  }

  async initialize() {
    const user = await this.usersService.getLoggedUser();
    if (user) {
      this.teacherKey.set(user.key);
      console.log("user", user);
      this.targetedClasses.set(user.classesKey);
    }
  }

  async ngOnInit() {

  }
}
