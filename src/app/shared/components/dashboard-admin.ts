import { Component } from '@angular/core';
import { IonGrid, IonRow, IonCol } from '@ionic/angular/standalone';
import { HomeSquareComponent } from './home-square/home-square.component';
@Component({
  standalone: true,
  // Il componente è selectorless
  selector: '',
  templateUrl: './dashboard-admin.html',
  styleUrls: ['./dashboard-admin.css'],
  imports: [
    IonGrid,
    IonRow,
    IonCol,
    HomeSquareComponent
  ]
})
export class DashboardAdmin {}
