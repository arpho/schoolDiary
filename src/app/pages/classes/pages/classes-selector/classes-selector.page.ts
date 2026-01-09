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
  IonLabel,
  IonButton
} from '@ionic/angular/standalone';
import { ClasseModel } from '../../models/classModel';
import { ClassiService } from '../../services/classi.service';
import { ClassViewerComponent } from '../../components/class-viewer/class-viewer.component';
import { ModalController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { checkmark, settingsOutline } from 'ionicons/icons';
import { AssignedClass } from '../../../subjects-list/models/assignedClass';
import { SubjectSelectorComponent } from '../../../subjects-list/components/subject-selector/subject-selector.component';
/**
 * Pagina/Modale per la selezione delle classi.
 * Utilizzato per assegnare classi ai docenti e gestire le materie assegnate.
 */
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
  /**
   * Gestisce la selezione/deselezione di una classe.
   * Se selezionata, apre il selettore delle materie.
   * @param classe Classe selezionata.
   * @param event Evento checkbox.
   */
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

  /**
   * Apre il selettore delle materie e ruoli per una classe assegnata.
   * @param assignedClass Classe assegnata.
   */
  async openSubjectSelector(assignedClass: AssignedClass) {
    const currentRole = assignedClass.coordinator ? 'coordinator' : (assignedClass.secretary ? 'secretary' : '');
    const modal = await this.$modal.create({
      component: SubjectSelectorComponent,
      componentProps: {
        selectedSubjectsKey: assignedClass.subjectsKey,
        currentRole: currentRole
      }
    });
    await modal.present();
    const { data, role: modalRole } = await modal.onDidDismiss();
    if (modalRole === 'confirm' && data) {
      assignedClass.subjectsKey = data.subjectsKey;
      assignedClass.coordinator = data.role === 'coordinator' ? 'true' : ''; // Using 'true' string to match potential model expectation if it's string
      assignedClass.secretary = data.role === 'secretary' ? 'true' : '';
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
