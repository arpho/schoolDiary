import { Component, ChangeDetectionStrategy } from '@angular/core';

/**
 * Dashboard specifica per i docenti.
 * Mostra le scorciatoie per le classi, agenda e altre funzionalità docenti.
 */
@Component({
  //selector: 'app-dashboard-teacher',
  templateUrl: './dashboard-teacher.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./dashboard-teacher.scss']
})
export class DashboardTeacherComponent {
  constructor() { }
}
