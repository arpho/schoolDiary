import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonGrid, IonRow, IonCol } from '@ionic/angular/standalone';
import { HomeSquareComponent } from 'src/app/shared/components/home-square/home-square.component';

@Component({
  selector: 'app-tutoring',
  templateUrl: './tutoring.page.html',
  styleUrls: ['./tutoring.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonGrid, IonRow, IonCol, CommonModule, FormsModule, HomeSquareComponent]
})
export class TutoringPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
