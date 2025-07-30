import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
   IonContent,
   IonHeader,
   IonTitle,
   IonToolbar,
   IonBackButton } from '@ionic/angular/standalone';
import { ListActivities4classComponent } from 'pages/classes/components/listActivities4class/list-activities4class/list-activities4class.component';

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
    ListActivities4classComponent
  ]
})
export class ClassDialogPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
