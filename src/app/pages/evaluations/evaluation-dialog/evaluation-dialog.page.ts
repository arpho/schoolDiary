import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-evaluation-dialog',
  templateUrl: './evaluation-dialog.page.html',
  styleUrls: ['./evaluation-dialog.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class EvaluationDialogPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
