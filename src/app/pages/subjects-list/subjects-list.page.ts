import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { SubjectModel } from './models/subjectModel';
import { signal } from '@angular/core';
import { SubjectService } from './services/subjects/subject.service';
@Component({
  selector: 'app-subjects-list',
  templateUrl: './subjects-list.page.html',
  styleUrls: ['./subjects-list.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class SubjectsListPage implements OnInit {
  subjectslist = signal<SubjectModel[]>([]);
  $subjects =inject(SubjectService)

  constructor() { }

  ngOnInit() {
      }

}
