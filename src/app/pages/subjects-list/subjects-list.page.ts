import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-subjects-list',
  templateUrl: './subjects-list.page.html',
  styleUrls: ['./subjects-list.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class SubjectsListPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
