import { Component } from '@angular/core';
import { IonGrid, IonRow, IonCol } from '@ionic/angular/standalone';
import { HomeSquareComponent } from '../home-square/home-square.component';
/* tslint:disable:component-selector */
/**
 * Dashboard specifica per l'utente amministratore.
 * Visualizza le opzioni di gestione (es. gestione classi, docenti, studenti).
 */
@Component({
  standalone: true,
  // Il componente è selectorless
  //selector: '',
  templateUrl: './dashboard-admin.html',
  styleUrls: ['./dashboard-admin.css'],
  imports: [
    IonGrid,
    IonRow,
    IonCol,
    HomeSquareComponent
  ]
})
export class DashboardAdminComponent { }
