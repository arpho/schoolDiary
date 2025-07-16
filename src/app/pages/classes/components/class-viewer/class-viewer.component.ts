import { Component, Input, OnInit } from '@angular/core';
import { ClasseModel } from '../../models/classModel';
import { IonCardContent, IonCardHeader, IonCardTitle, IonCard } from "@ionic/angular/standalone";

@Component({
  selector: 'app-class-viewer',
  templateUrl: './class-viewer.component.html',
  styleUrls: ['./class-viewer.component.scss'],
  imports: [IonCardContent, IonCardHeader, IonCardTitle, IonCard],
})
export class ClassViewerComponent  implements OnInit {
  @Input() classe: ClasseModel = new ClasseModel();

  constructor() { }

  ngOnInit() {}

}
