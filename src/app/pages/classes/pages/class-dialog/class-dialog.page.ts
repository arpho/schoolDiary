import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonBackButton,
  IonSegment,
  IonSegmentButton,
  IonFab,
  IonFabButton,
  IonIcon,
  ModalController
} from '@ionic/angular/standalone';
import { ListActivities4classComponent } from '../../components/listActivities4class/list-activities4class/list-activities4class.component';
import { AgendaDisplayComponent } from 'src/app/shared/components/agenda-display/agenda-display.component';
import { AgendaEventInputComponent } from 'src/app/shared/components/agenda-event-input/agenda-event-input.component';
import { ActivatedRoute } from '@angular/router';
import { inject, signal } from '@angular/core';
import { UsersService } from 'src/app/shared/services/users.service';
import { addIcons } from 'ionicons';
import { add } from 'ionicons/icons';

@Component({
  selector: 'app-class-dialog',
  templateUrl: './class-dialog.page.html',
  styleUrls: ['./class-dialog.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonBackButton,
    IonBackButton,
    ListActivities4classComponent,
    IonSegment,
    IonSegmentButton,
    AgendaDisplayComponent,
    IonFab,
    IonFabButton,
    IonIcon
  ]
})
export class ClassDialogPage implements OnInit {
  private route = inject(ActivatedRoute);
  private usersService = inject(UsersService);
  private modalCtrl = inject(ModalController);

  segmentValue = signal<'activities' | 'agenda'>('activities');
  classKey = signal<string>('');
  teacherKey = signal<string>('');

  constructor() {
    addIcons({ add });
  }

  async ngOnInit() {
    this.classKey.set(this.route.snapshot.paramMap.get('key') || '');
    const user = await this.usersService.getLoggedUser();
    if (user) {
      this.teacherKey.set(user.key);
    }
  }

  segmentChanged(ev: any) {
    this.segmentValue.set(ev.detail.value);
  }

  async addEvent() {
    const modal = await this.modalCtrl.create({
      component: AgendaEventInputComponent,
      componentProps: {
        classKey: this.classKey(),
        teacherKey: this.teacherKey()
      }
    });
    await modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm') {
      // Refresh logic if needed, but AgendaDisplay listens to Firebase so it should update automatically
    }
  }


}
