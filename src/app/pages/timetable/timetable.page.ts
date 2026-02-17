import { Component, OnInit, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonSpinner, IonText } from '@ionic/angular/standalone';
import { TimetableService } from './services/timetable.service';
import { UsersService } from 'src/app/shared/services/users.service';
import { TimetableModel } from './models/timetable.model';
import { QueryCondition } from 'src/app/shared/models/queryCondition';
import { TimetableToastUiComponent } from './components/timetable-toast-ui/timetable-toast-ui.component';

@Component({
  selector: 'app-timetable',
  templateUrl: './timetable.page.html',
  styleUrls: ['./timetable.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonSpinner, IonText, TimetableToastUiComponent]
})
export class TimetablePage implements OnInit, OnDestroy {
  private timetableService = inject(TimetableService);
  private usersService = inject(UsersService);

  timetable = signal<TimetableModel[]>([]);
  loading = signal<boolean>(true);

  private unsubscribeTimetable: (() => void) | null = null;

  constructor() { }

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

}
