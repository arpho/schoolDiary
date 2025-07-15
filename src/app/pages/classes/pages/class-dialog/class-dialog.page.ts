import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-class-dialog',
  templateUrl: './class-dialog.page.html',
  styleUrls: ['./class-dialog.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ClassDialogPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
