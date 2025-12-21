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
  IonIcon,
  IonLabel
} from '@ionic/angular/standalone';
import { ClasseModel } from '../../models/classModel';
import { ClassiService } from '../../services/classi.service';
import { ClassViewerComponent } from '../../components/class-viewer/class-viewer.component';
import { ModalController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { checkmark, settingsOutline } from 'ionicons/icons';
import { AssignedClass } from '../../../subjects-list/models/assignedClass';
import { SubjectSelectorComponent } from '../../../subjects-list/components/subject-selector/subject-selector.component';
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
    IonIcon,
    IonLabel,
    SubjectSelectorComponent
  ]
})
export class ClassesSelectorPage implements OnInit {
  close() {
    this.$modal.dismiss(this.selectedClasses);
  }

  constructor(
    private $classes: ClassiService,
    private $modal: ModalController
  ) {

    addIcons({
      checkmark,
      settingsOutline
    });
  }

  getSelectedAssignedClass(classe: ClasseModel) {
    return this.selectedClasses.find((selectedClass) => selectedClass.key === classe.key);
  }

  async editSubjects(classe: ClasseModel) {
    const assignedClass = this.getSelectedAssignedClass(classe);
    if (assignedClass) {
      await this.openSubjectSelector(assignedClass);
    }
  }

  isClassSelected(classe: ClasseModel) {
    return !!this.getSelectedAssignedClass(classe);
  }
  async selectedClass(classe: ClasseModel, event: any) {
    console.log("selectedClass", classe);
    console.log("event", event);
    if (event.detail.checked) {
      const assignedClass = new AssignedClass(classe);
      this.selectedClasses.push(assignedClass);
      await this.openSubjectSelector(assignedClass);
    } else {
      const index = this.selectedClasses.findIndex(c => c.key === classe.key);
      if (index > -1) {
        this.selectedClasses.splice(index, 1);
      }
    }
  }

  async openSubjectSelector(assignedClass: AssignedClass) {
    const modal = await this.$modal.create({
      component: SubjectSelectorComponent,
      componentProps: {
        selectedSubjectsKey: assignedClass.subjectsKey
      }
    });
    await modal.present();
    const { data, role } = await modal.onDidDismiss();
    if (role === 'confirm' && data) {
      assignedClass.subjectsKey = data;
    }
  }

  @Input() selectedClasses: AssignedClass[] = [];
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
    this.$classes.getClassiOnRealtime()
      .subscribe((classi) => {
        this.classi.set(classi.sort((a, b) => this.makeClassTitle(a).localeCompare(this.makeClassTitle(b))));
      });
  }

}
