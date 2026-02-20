import { Component, OnInit, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonSpinner, IonText, IonIcon, ModalController, IonFab, IonFabButton, IonButtons, IonBackButton } from '@ionic/angular/standalone';
import { TimetableService } from './services/timetable.service';
import { UsersService } from 'src/app/shared/services/users.service';
import { TimetableModel } from './models/timetable.model';
import { QueryCondition } from 'src/app/shared/models/queryCondition';
import { TimetableToastUiComponent } from './components/timetable-toast-ui/timetable-toast-ui.component';
import { TimeslotDialogComponent } from './components/timeslot-dialog/timeslot-dialog.component';
import { addIcons } from 'ionicons';
import { add } from 'ionicons/icons';

@Component({
  selector: 'app-timetable',
  templateUrl: './timetable.page.html',
  styleUrls: ['./timetable.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonSpinner, IonText, IonIcon, TimetableToastUiComponent, IonFab, IonFabButton, IonButtons, IonBackButton]
})
export class TimetablePage implements OnInit, OnDestroy {
  private timetableService = inject(TimetableService);
  private usersService = inject(UsersService);

  timetable = signal<TimetableModel[]>([]);
  loading = signal<boolean>(true);

  private unsubscribeTimetable: (() => void) | null = null;
  private modalController = inject(ModalController);

  constructor() {
    addIcons({ add });
  }

  async ngOnInit() {
    const user = await this.usersService.getLoggedUser();
    if (user && user.key) {
      this.unsubscribeTimetable = this.timetableService.fetchTimetableListOnRealTime(
        (timetable) => {
          this.timetable.set(timetable);
          this.loading.set(false);
        },
        [new QueryCondition('teacherKey', '==', user.key)]
      );
    } else {
      this.loading.set(false);
    }
  }

  ngOnDestroy() {
    if (this.unsubscribeTimetable) {
      this.unsubscribeTimetable();
    }
  }

  async openTimeslotDialog(item?: TimetableModel) {
    const modal = await this.modalController.create({
      component: TimeslotDialogComponent,
      componentProps: {
        item: item
      }
    });

    modal.onDidDismiss().then((result) => {
      if (result.role === 'confirm' && result.data) {
        const newSlot = result.data as TimetableModel;
        
        if (item && item.key) {
          // Update existing item
          newSlot.setKey(item.key);
          newSlot.teacherKey = item.teacherKey; // Preserve teacher key
          this.timetableService.updateTimetableItem(newSlot);
        } else {
          // Create new item
          this.usersService.getLoggedUser().then(user => {
            if (user && user.key) {
              newSlot.teacherKey = user.key;
              this.timetableService.createTimetableItem(newSlot);
            }
          });
        }
      } else if (result.role === 'delete' && item && item.key) {
        this.timetableService.deleteTimetableItem(item.key);
      }
    });

    await modal.present();
  }
}
