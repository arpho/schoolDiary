import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

/**
 * Componente per la modifica di una materia (placeholder/non in uso?).
 */
@Component({
  selector: 'app-edit-subject',
  templateUrl: './edit-subject.page.html',
  styleUrls: ['./edit-subject.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class EditSubjectPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
