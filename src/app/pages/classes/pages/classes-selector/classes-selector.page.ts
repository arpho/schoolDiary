import {
  Component,
  computed,
  Input,
  OnInit,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent,
  IonList,
  IonItem,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonSelectOption,
  IonSelect } from '@ionic/angular/standalone';
import { ClasseModel } from '../../models/classModel';
import { ClassiService } from '../../services/classi.service';
import { ClassViewerComponent } from '../../components/class-viewer/class-viewer.component';

@Component({
  selector: 'app-classes-selector',
  templateUrl: './classes-selector.page.html',
  styleUrls: ['./classes-selector.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonList,
    IonItem,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    ClassViewerComponent,
    IonSelectOption,
    IonSelect
]
})
export class ClassesSelectorPage implements OnInit {
  @Input() selectedClasses: ClasseModel[] = [];
  classi = signal<ClasseModel[]>([]); 
  anniScolastici = computed(() => {
    const anniScolastici: string[] = [];
    this.classi().forEach((classe) => {
      if (!anniScolastici.includes(classe.year)) {
        anniScolastici.push(classe.year);
      }
    });
    return new Set(anniScolastici);
  });

  constructor(
    private $classes: ClassiService
  ) { }

  ngOnInit() {
    this.$classes.getClassiOnRealtime((classi) => {
      this.classi.set(classi);
    });
  }

}
