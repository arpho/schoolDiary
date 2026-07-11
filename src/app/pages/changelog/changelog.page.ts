import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { bookOutline, lockClosedOutline, personOutline, refreshOutline, alertCircleOutline, checkmarkDoneOutline, listOutline, peopleCircleOutline, gridOutline, logOutOutline, syncOutline, micOutline, swapHorizontalOutline, addCircleOutline, shieldCheckmarkOutline, desktopOutline, videocamOutline } from 'ionicons/icons';

@Component({
  selector: 'app-changelog',
  templateUrl: './changelog.page.html',
  styleUrls: ['./changelog.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonIcon,
    FormsModule
]
})
export class ChangelogPage implements OnInit {

  constructor() {
    addIcons({ bookOutline, lockClosedOutline, personOutline, refreshOutline, alertCircleOutline, checkmarkDoneOutline, listOutline, peopleCircleOutline, gridOutline, logOutOutline, syncOutline, micOutline, swapHorizontalOutline, addCircleOutline, shieldCheckmarkOutline, desktopOutline, videocamOutline });
  }

  ngOnInit() {
  }

}
