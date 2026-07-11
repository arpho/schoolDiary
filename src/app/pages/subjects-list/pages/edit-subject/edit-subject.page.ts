import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

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
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, FormsModule]
})
export class EditSubjectPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
