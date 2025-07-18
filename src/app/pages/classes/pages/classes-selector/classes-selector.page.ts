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
   IonSelect,
   IonCheckbox,
   IonFabButton,
   IonIcon
} from '@ionic/angular/standalone';
import { ClasseModel } from '../../models/classModel';
import { ClassiService } from '../../services/classi.service';
import { ClassViewerComponent } from '../../components/class-viewer/class-viewer.component';
import { ModalController } from '@ionic/angular';
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
    IonSelect,
    IonCheckbox,
    IonFabButton,
    IonIcon
  ]
})
export class ClassesSelectorPage implements OnInit {
close() {
this.$modal.dismiss();
}

  constructor(
    private $classes: ClassiService,
    private $modal: ModalController
  ) { }
isClassSelected(classe: ClasseModel) {
  return this.selectedClasses.some((selectedClass) => selectedClass.key === classe.key);
}
selectedClass(classe: ClasseModel, event: any) {
  console.log("selectedClass", classe);
  console.log("event", event);
  if(event.detail.checked){
    this.selectedClasses.push(classe);
  }else{
    this.selectedClasses.splice(this.selectedClasses.indexOf(classe), 1);
  }
}
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
  makeClassTitle(classe: ClasseModel) {
      return `${classe.classe}`;
  }


  ngOnInit() {
    console.log("selectedClasses", this.selectedClasses);
    this.$classes.getClassiOnRealtime((classi) => {
      this.classi.set(classi.sort((a, b) => this.makeClassTitle(a).localeCompare(this.makeClassTitle(b))));
    });
  }

}
