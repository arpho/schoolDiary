import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-gridsdialog',
  templateUrl: './gridsdialog.html',
  styleUrls: ['./gridsdialog.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class Gridsdialog implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
