import {
  Component,
  computed,
  input,
  signal,
  inject,
  effect
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
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
export class ClassesSelectorPage {
  private readonly classiService = inject(ClassiService);
  private readonly modalController = inject(ModalController);

  selectedClasses = input<AssignedClass[]>([]);
  localSelectedClasses = signal<AssignedClass[]>([]);

  classi = toSignal(
    this.classiService.getClassiOnRealtime().pipe(
      map(classi => [...classi].sort((a, b) => this.makeClassTitle(a).localeCompare(this.makeClassTitle(b))))
    ),
    { initialValue: [] }
  );

  anniScolastici = computed(() => {
    const anniScolastici: string[] = [];
    this.classi().forEach((classe) => {
      if (!anniScolastici.includes(classe.year)) {
        anniScolastici.push(classe.year);
      }
    });
    return new Set(anniScolastici);
  });

  constructor() {
    addIcons({
      checkmark,
      settingsOutline
    });

    effect(() => {
      this.localSelectedClasses.set([...this.selectedClasses()]);
    }, { allowSignalWrites: true });
  }

  close() {
    this.modalController.dismiss(this.localSelectedClasses());
  }

  makeClassTitle(classe: ClasseModel) {
    return `${classe.classe}`;
  }

  getSelectedAssignedClass(classe: ClasseModel) {
    return this.localSelectedClasses().find((selectedClass) => selectedClass.key === classe.key);
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
      this.localSelectedClasses.update(list => [...list, assignedClass]);
      await this.openSubjectSelector(assignedClass);
    } else {
      this.localSelectedClasses.update(list => list.filter(c => c.key !== classe.key));
    }
  }

  /**
   * Apre il selettore delle materie e ruoli per una classe assegnata.
   * @param assignedClass Classe assegnata.
   */
  async openSubjectSelector(assignedClass: AssignedClass) {
    const currentRole = assignedClass.coordinator ? 'coordinator' : (assignedClass.secretary ? 'secretary' : '');
    const modal = await this.modalController.create({
      component: SubjectSelectorComponent,
      componentProps: {
        selectedSubjectsKey: assignedClass.subjectsKey,
        currentRole: currentRole
      }
    });
    await modal.present();
    const { data, role: modalRole } = await modal.onDidDismiss();
    if (modalRole === 'confirm' && data) {
      this.localSelectedClasses.update(list => list.map(c => {
        if (c.key === assignedClass.key) {
          const updated = new AssignedClass(c);
          updated.subjectsKey = data.subjectsKey;
          updated.coordinator = data.role === 'coordinator' ? 'true' : '';
          updated.secretary = data.role === 'secretary' ? 'true' : '';
          return updated;
        }
        return c;
      }));
    }
  }
}
