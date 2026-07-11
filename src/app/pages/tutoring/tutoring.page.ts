import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonGrid, IonRow, IonCol } from '@ionic/angular/standalone';
import { HomeSquareComponent } from 'src/app/shared/components/home-square/home-square.component';

@Component({
  selector: 'app-tutoring',
  templateUrl: './tutoring.page.html',
  styleUrls: ['./tutoring.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonGrid, IonRow, IonCol, FormsModule, HomeSquareComponent]
})
export class TutoringPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
