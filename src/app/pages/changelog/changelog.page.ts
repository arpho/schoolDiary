import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { bookOutline, lockClosedOutline, personOutline, refreshOutline } from 'ionicons/icons';

@Component({
  selector: 'app-changelog',
  templateUrl: './changelog.page.html',
  styleUrls: ['./changelog.page.scss'],
  standalone: true,
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
    CommonModule,
    FormsModule
  ]
})
export class ChangelogPage implements OnInit {

  constructor() {
    addIcons({ bookOutline, lockClosedOutline, personOutline, refreshOutline });
  }

  ngOnInit() {
  }

}
